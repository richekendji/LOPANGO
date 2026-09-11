import Link from "next/link";
import { signUp } from "@/app/actions/auth";
import { AuthBackLink } from "@/components/AuthBackLink";
import { PhoneInput } from "@/components/PhoneInput";

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

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;

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

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {ERRORS[error] ?? "Une erreur est survenue."}
          </div>
        )}

        <form
          action={signUp}
          className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm"
        >
          <div className="grid grid-cols-2 gap-3">
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

          <label className="block space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              Mot de passe
            </span>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className={field}
              placeholder="Au moins 8 caractères"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              Confirmer le mot de passe
            </span>
            <input
              name="passwordConfirm"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className={field}
              placeholder="Retapez le mot de passe"
            />
          </label>

          <button
            type="submit"
            className="rounded-full bg-zinc-900 py-3.5 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Créer mon compte
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          Déjà un compte ?{" "}
          <Link
            href="/login"
            className="font-semibold text-zinc-900 underline-offset-2 hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
