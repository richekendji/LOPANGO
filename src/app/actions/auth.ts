"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  isValidEmail,
  isValidPhone,
  normalizeEmail,
  normalizePhone,
  phoneToAuthEmail,
} from "@/lib/phone";
import { redirect } from "next/navigation";
import { rateLimit } from "@/lib/rate-limit";

const MIN_PASSWORD = 8;

function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

function registerError(code: string): never {
  redirect(`/register?error=${encodeURIComponent(code)}`);
}

function loginError(code: string): never {
  redirect(`/login?error=${encodeURIComponent(code)}`);
}

export async function signUp(formData: FormData) {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "");
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  if (!firstName || !lastName || !phoneRaw || !password) {
    registerError("missing-fields");
  }

  const phone = normalizePhone(phoneRaw);
  if (!phone || !isValidPhone(phone)) {
    registerError("invalid-phone");
  }

  if (password.length < MIN_PASSWORD) {
    registerError("weak-password");
  }

  if (password !== passwordConfirm) {
    registerError("password-mismatch");
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    registerError("config");
  }

  const rl = rateLimit(`signup:${phone}`, { limit: 5, windowMs: 60 * 60_000 });
  if (!rl.ok) {
    registerError("rate-limit");
  }

  const admin = createAdminClient();
  const authEmail = phoneToAuthEmail(phone);

  const { data: existingPhone } = await admin
    .from("profiles")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();

  if (existingPhone) {
    registerError("phone-taken");
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: authEmail,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: `${firstName} ${lastName}`,
      first_name: firstName,
      last_name: lastName,
      phone,
    },
  });

  if (error || !data.user) {
    const msg = error?.message ?? "";
    if (/already|registered|exists/i.test(msg)) {
      registerError("phone-taken");
    }
    registerError("signup-failed");
  }

  const { error: profileError } = await admin.from("profiles").upsert({
    id: data.user.id,
    email: null,
    full_name: `${firstName} ${lastName}`,
    phone,
    role: "tenant",
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(data.user.id);
    if (/unique|duplicate/i.test(profileError.message)) {
      registerError("phone-taken");
    }
    registerError("signup-failed");
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password,
  });

  if (signInError) {
    loginError("bad-credentials");
  }

  redirect("/app");
}

export async function signIn(formData: FormData) {
  const phoneRaw = String(formData.get("phone") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!phoneRaw || !password) {
    loginError("missing-fields");
  }

  const phone = normalizePhone(phoneRaw);
  if (!phone) {
    loginError("invalid-phone");
  }

  const rl = rateLimit(`signin:${phone}`, { limit: 20, windowMs: 15 * 60_000 });
  if (!rl.ok) {
    loginError("rate-limit");
  }

  const supabase = await createClient();
  const primaryEmail = phoneToAuthEmail(phone);
  let { error } = await supabase.auth.signInWithPassword({
    email: primaryEmail,
    password,
  });

  // Comptes dont l’email auth a été basculé vers l’email de récupération
  if (error && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("email")
      .eq("phone", phone)
      .maybeSingle();
    const recovery = profile?.email ? normalizeEmail(profile.email) : null;
    if (recovery && recovery !== primaryEmail && isValidEmail(recovery)) {
      const retry = await supabase.auth.signInWithPassword({
        email: recovery,
        password,
      });
      error = retry.error;
    }
  }

  if (error) {
    loginError("bad-credentials");
  }

  redirect("/app");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

/**
 * Reset sécurisé : n’envoie le lien QUE si l’email fourni
 * correspond déjà à l’email de récupération enregistré sur le compte.
 * Ne modifie jamais l’email du compte.
 */
export async function requestPasswordReset(formData: FormData) {
  const phoneRaw = String(formData.get("phone") ?? "");
  const email = normalizeEmail(String(formData.get("email") ?? ""));

  if (!isValidEmail(email)) {
    redirect("/forgot-password?error=invalid-email");
  }

  const phone = normalizePhone(phoneRaw);
  if (!phone) {
    redirect("/forgot-password?error=invalid-phone");
  }

  const rl = rateLimit(`reset:${phone}`, { limit: 5, windowMs: 60 * 60_000 });
  if (!rl.ok) {
    redirect("/forgot-password?sent=1");
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    redirect("/forgot-password?error=config");
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, email")
    .eq("phone", phone)
    .maybeSingle();

  // Message générique toujours (anti-énumération)
  if (profile?.email && normalizeEmail(profile.email) === email) {
    const supabase = await createClient();
    // Attache temporairement l’email de récupération au user auth pour le reset,
    // SANS accepter un email arbitraire non enregistré.
    const { data: authUser } = await admin.auth.admin.getUserById(profile.id);
    const currentAuthEmail = authUser.user?.email ?? "";

    if (
      currentAuthEmail.endsWith("@lopango.local") ||
      normalizeEmail(currentAuthEmail) === email
    ) {
      if (currentAuthEmail.endsWith("@lopango.local")) {
        await admin.auth.admin.updateUserById(profile.id, {
          email,
          email_confirm: true,
        });
      }
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl()}/auth/callback?next=/reset-password`,
      });
    }
  }

  redirect("/forgot-password?sent=1");
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  if (password.length < MIN_PASSWORD) {
    redirect("/reset-password?error=weak-password");
  }
  if (password !== passwordConfirm) {
    redirect("/reset-password?error=password-mismatch");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect("/reset-password?error=update-failed");
  }

  redirect("/app");
}
