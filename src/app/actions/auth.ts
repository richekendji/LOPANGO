"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  isValidEmail,
  isValidPhone,
  normalizeEmail,
  normalizePhone,
} from "@/lib/phone";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

function registerError(code: string, role?: string): never {
  const q = new URLSearchParams({ error: code });
  if (role) q.set("role", role);
  redirect(`/register?${q.toString()}`);
}

function loginError(code: string): never {
  redirect(`/login?error=${encodeURIComponent(code)}`);
}

export async function signUp(formData: FormData) {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "");
  const emailRaw = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");
  const roleRaw = String(formData.get("role") ?? "tenant");
  const role = roleRaw === "owner" ? "owner" : "tenant";

  if (!firstName || !lastName || !phoneRaw || !emailRaw || !password) {
    registerError("missing-fields", role);
  }

  const phone = normalizePhone(phoneRaw);
  if (!phone || !isValidPhone(phone)) {
    registerError("invalid-phone", role);
  }

  const email = normalizeEmail(emailRaw);
  if (!isValidEmail(email)) {
    registerError("invalid-email", role);
  }

  if (password.length < 6) {
    registerError("weak-password", role);
  }

  if (password !== passwordConfirm) {
    registerError("password-mismatch", role);
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    registerError(
      "Configuration incomplète : SUPABASE_SERVICE_ROLE_KEY manquante.",
      role,
    );
  }

  const admin = createAdminClient();

  // Numéro déjà utilisé ?
  const { data: existingPhone } = await admin
    .from("profiles")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();

  if (existingPhone) {
    registerError("phone-taken", role);
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: `${firstName} ${lastName}`,
      first_name: firstName,
      last_name: lastName,
      role,
      phone,
    },
  });

  if (error || !data.user) {
    const msg = error?.message ?? "";
    if (/already|registered|exists/i.test(msg)) {
      registerError("email-taken", role);
    }
    registerError(msg || "Création du compte impossible.", role);
  }

  const { error: profileError } = await admin.from("profiles").upsert({
    id: data.user.id,
    email,
    full_name: `${firstName} ${lastName}`,
    phone,
    role,
  });

  if (profileError) {
    // Rollback auth user si le numéro unique échoue (course rare)
    await admin.auth.admin.deleteUser(data.user.id);
    if (/unique|duplicate/i.test(profileError.message)) {
      registerError("phone-taken", role);
    }
    registerError(profileError.message, role);
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    loginError(signInError.message);
  }

  revalidatePath("/", "layout");
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

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    loginError("Configuration serveur incomplète.");
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, email")
    .eq("phone", phone)
    .maybeSingle();

  if (!profile) {
    loginError("bad-credentials");
  }

  let email = profile.email as string | null;
  if (!email) {
    const { data: userData } = await admin.auth.admin.getUserById(profile.id);
    email = userData.user?.email ?? null;
  }

  if (!email) {
    loginError("bad-credentials");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    loginError("bad-credentials");
  }

  revalidatePath("/", "layout");
  redirect("/app");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

/** Envoie le lien/code de réinitialisation à l'email choisi. */
export async function requestPasswordReset(formData: FormData) {
  const email = normalizeEmail(String(formData.get("email") ?? ""));

  if (!isValidEmail(email)) {
    redirect("/forgot-password?error=invalid-email");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl()}/auth/callback?next=/reset-password`,
  });

  if (error) {
    redirect(
      `/forgot-password?error=${encodeURIComponent(error.message)}`,
    );
  }

  redirect("/forgot-password?sent=1");
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  if (password.length < 6) {
    redirect("/reset-password?error=weak-password");
  }
  if (password !== passwordConfirm) {
    redirect("/reset-password?error=password-mismatch");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(
      `/reset-password?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/", "layout");
  redirect("/app");
}
