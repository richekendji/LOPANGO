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
  const roleRaw = String(formData.get("role") ?? "tenant");
  const role = roleRaw === "owner" ? "owner" : "tenant";

  if (!firstName || !lastName) {
    redirect("/register?error=missing-fields");
  }

  const identifier = generateIdentifier(firstName, lastName);
  const password = generatePassword();
  const email = identifierToEmail(identifier);

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    redirect(
      "/register?error=" +
        encodeURIComponent(
          "Configuration incomplète : la clé SUPABASE_SERVICE_ROLE_KEY manque dans .env.local. Ajoutez-la puis redémarrez le serveur.",
        ),
    );
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: `${firstName} ${lastName}`,
      first_name: firstName,
      last_name: lastName,
      role,
      username: identifier,
    },
  });

  if (error || !data.user) {
    redirect(
      `/register?error=${encodeURIComponent(
        error?.message ?? "Création du compte impossible.",
      )}`,
    );
  }

  // Table profiles optionnelle (sera branchée avec la DB) — on ignore l'échec
  try {
    await admin
      .from("profiles")
      .update({
        full_name: `${firstName} ${lastName}`,
        role,
        username: identifier,
      })
      .eq("id", data.user.id);
  } catch {
    // ignore
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    redirect(`/login?identifier=${encodeURIComponent(identifier)}`);
  }

  revalidatePath("/", "layout");

  const cookieStore = await cookies();
  cookieStore.set(
    "lopango_new_credentials",
    JSON.stringify({ identifier, password }),
    {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 300,
      secure: process.env.NODE_ENV === "production",
    },
  );

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
  redirect("/app");
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
  redirect("/app");
}
