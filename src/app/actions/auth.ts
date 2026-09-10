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

  if (password.length < 6) {
    registerError("weak-password");
  }

  if (password !== passwordConfirm) {
    registerError("password-mismatch");
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    registerError(
      "Configuration incomplète : SUPABASE_SERVICE_ROLE_KEY manquante.",
    );
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
    registerError(msg || "Création du compte impossible.");
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
    registerError(profileError.message);
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: authEmail,
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

  let email = (profile.email as string | null) || null;
  if (!email || email.endsWith("@lopango.local")) {
    email = phoneToAuthEmail(phone);
  }

  const { data: userData } = await admin.auth.admin.getUserById(profile.id);
  const authEmail = userData.user?.email || email;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: authEmail,
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

/**
 * Récupération : l'utilisateur choisit l'email où recevoir le lien.
 * On rattache cet email au compte trouvé via le numéro, puis on envoie le mail.
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

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    redirect("/forgot-password?error=config");
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();

  // Ne pas révéler si le numéro existe : message générique
  if (profile) {
    const { error: updateError } = await admin.auth.admin.updateUserById(
      profile.id,
      { email, email_confirm: true },
    );

    if (!updateError) {
      await admin.from("profiles").update({ email }).eq("id", profile.id);

      const supabase = await createClient();
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
