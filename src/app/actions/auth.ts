"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  generateIdentifier,
  generatePassword,
  identifierToEmail,
  normalizeIdentifier,
} from "@/lib/credentials";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signUp(formData: FormData) {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const role = String(formData.get("role") ?? "tenant");

  if (!firstName || !lastName) {
    redirect("/register?error=missing-fields");
  }

  // Identifiants générés automatiquement (affichés à l'utilisateur après création)
  const identifier = generateIdentifier(firstName, lastName);
  const password = generatePassword();
  const email = identifierToEmail(identifier);

  // La clé admin est requise pour créer des comptes sans email de confirmation
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    redirect(
      "/register?error=" +
        encodeURIComponent(
          "Configuration incomplète : la clé SUPABASE_SERVICE_ROLE_KEY manque dans .env.local. Ajoutez-la puis redémarrez le serveur.",
        ),
    );
  }

  // Création du compte via le client ADMIN : pas d'email de confirmation,
  // l'utilisateur est directement connecté après l'inscription.
  const admin = await createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: `${firstName} ${lastName}`,
      first_name: firstName,
      last_name: lastName,
      role,
    },
  });

  if (error || !data.user) {
    redirect(
      `/register?error=${encodeURIComponent(
        error?.message ?? "Création du compte impossible.",
      )}`,
    );
  }

  // Ligne "profiles" : le trigger Supabase en crée déjà une à l'inscription,
  // on met simplement à jour les champs métier.
  await admin
    .from("profiles")
    .update({
      full_name: `${firstName} ${lastName}`,
      role,
      username: identifier,
    })
    .eq("id", data.user.id);

  // Connexion immédiate avec le client "classique" (cookies de session)
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    // Le compte existe : on demande à l'utilisateur de se connecter manuellement
    redirect(`/login?identifier=${encodeURIComponent(identifier)}`);
  }

  revalidatePath("/", "layout");

  // Cookie temporaire (httpOnly) pour afficher les identifiants une seule fois
  const cookieStore = await cookies();
  cookieStore.set("lopango_new_credentials", JSON.stringify({ identifier, password }), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 300, // 5 minutes
    secure: process.env.NODE_ENV === "production",
  });

  redirect("/register/success");
}

export async function signIn(formData: FormData) {
  const identifier = normalizeIdentifier(
    String(formData.get("identifier") ?? ""),
  );
  const password = String(formData.get("password") ?? "");

  if (!identifier || !password) {
    redirect("/login?error=missing-fields");
  }

  // L'identifiant correspond à un email technique caché
  const email = identifierToEmail(identifier);

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

/** Supprime le cookie des identifiants affichés une seule fois. */
export async function clearNewCredentials() {
  const cookieStore = await cookies();
  cookieStore.delete("lopango_new_credentials");
  redirect("/dashboard");
}

export async function updateProfile(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "");
  const phone = String(formData.get("phone") ?? "");
  const role = String(formData.get("role") ?? "");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone, role })
    .eq("id", user.id);

  if (error) {
    redirect(`/dashboard/profile?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard/profile?updated=1");
}