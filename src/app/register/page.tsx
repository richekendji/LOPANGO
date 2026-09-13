import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { signUp } from "@/app/actions/auth";
import { AuthBackLink } from "@/components/AuthBackLink";
import { AuthQueryAlert } from "@/components/AuthQueryAlert";
import { PasswordField } from "@/components/PasswordField";
import { PhoneInput } from "@/components/PhoneInput";
import { SubmitButton } from "@/components/SubmitButton";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Créer un compte",
  description:
    "Inscrivez-vous sur LOPANGO : prénom, nom, numéro Congo et email de récupération. Ensuite, cherchez ou publiez une maison.",
  path: "/register",
});

const ERRORS: Record<string, string> = {
  "missing-fields": "Veuillez remplir tous les champs.",
  "invalid-phone": "Numéro invalide. Format : 06 ou 05 + 123 45 67.",
  "invalid-email": "Email de récupération invalide.",
  "weak-password": "Le mot de passe doit contenir au moins 8 caractères.",
  "password-mismatch": "Les mots de passe ne correspondent pas.",
  "phone-taken":
    "Ce numéro est déjà utilisé. Connectez-vous ou utilisez un autre numéro.",
  config: "Configuration serveur incomplète.",
  "rate-limit": "Trop de tentatives. Réessayez plus tard.",
  "signup-failed": "Création du compte impossible. Réessayez.",
};

export default function RegisterPage() {
  const field =
    "w-full rounded-2xl border border-[#ebebeb] bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400";

  return (
    <div className="min-h-full bg-[#f5f5f5]">
      <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-10">
        <AuthBackLink href="/" />
        <div className="text-center">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-zinc-900"
          >
            LOPANGO
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-zinc-900">
            Créer un compte
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Prénom, nom, numéro, email de récupération et mot de passe.
          </p>
        </div>

        <Suspense>
          <AuthQueryAlert errors={ERRORS} />
        </Suspense>

        <form
          action={signUp}
          className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                Prénom
              </span>
              <input
                name="firstName"
                type="text"
                required
                autoComplete="given-name"
                className={field}
                placeholder="Jean"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                Nom
              </span>
              <input
                name="lastName"
                type="text"
                required
                autoComplete="family-name"
                className={field}
                placeholder="Dupont"
              />
            </label>
          </div>

          <PhoneInput />

          <label className="block space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              Email de récupération
            </span>
            <input
              name="recoveryEmail"
              type="email"
              required
              autoComplete="email"
              className={field}
              placeholder="vous@email.com"
            />
            <span className="text-[11px] text-zinc-400">
              Obligatoire pour réinitialiser le mot de passe.
            </span>
          </label>

          <PasswordField
            name="password"
            label="Mot de passe"
            autoComplete="new-password"
            minLength={8}
            placeholder="Au moins 8 caractères"
          />

          <PasswordField
            name="passwordConfirm"
            label="Confirmer le mot de passe"
            autoComplete="new-password"
            minLength={8}
            placeholder="Retapez le mot de passe"
          />

          <SubmitButton pendingLabel="Création…">Créer mon compte</SubmitButton>
        </form>

        <p className="text-center text-sm text-zinc-500">
          Déjà un compte ?{" "}
          <Link
            href="/login"
            prefetch
            className="font-semibold text-zinc-900 underline-offset-2 hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
