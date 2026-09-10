import Link from "next/link";
import { signUp } from "@/app/actions/auth";
import { PhoneInput } from "@/components/PhoneInput";

const ERRORS: Record<string, string> = {
  "missing-fields": "Veuillez remplir tous les champs.",
  "invalid-phone": "Numéro invalide. Format : 06 ou 05 + 123 45 67.",
  "invalid-email": "Adresse email invalide.",
  "weak-password": "Le mot de passe doit contenir au moins 6 caractères.",
  "password-mismatch": "Les mots de passe ne correspondent pas.",
  "phone-taken": "Ce numéro est déjà utilisé. Connectez-vous ou utilisez un autre numéro.",
  "email-taken": "Cet email est déjà utilisé. Choisissez-en un autre pour la récupération.",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; role?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;
  const defaultRole = params.role === "owner" ? "owner" : "tenant";

  const field =
    "w-full rounded-2xl border border-[#ebebeb] bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400";

  return (
    <div className="min-h-full bg-[#f5f5f5]">
      <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-10">
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
            Prénom, nom, numéro et mot de passe. Vous êtes ensuite directement
            dans l&apos;app.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {ERRORS[error] ?? error}
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
              name="email"
              type="email"
              required
              autoComplete="email"
              className={field}
              placeholder="vous@email.com"
            />
            <p className="text-[11px] text-zinc-400">
              Utilisé uniquement si vous oubliez votre mot de passe — pas pour
              vous connecter.
            </p>
          </label>

          <label className="block space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              Mot de passe
            </span>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className={field}
              placeholder="Au moins 6 caractères"
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
              minLength={6}
              autoComplete="new-password"
              className={field}
              placeholder="Retapez le mot de passe"
            />
          </label>

          <fieldset className="space-y-2">
            <legend className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              Vous êtes ?
            </legend>
            <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[#ebebeb] px-3 py-2.5 text-sm text-zinc-800">
              <input
                type="radio"
                name="role"
                value="tenant"
                defaultChecked={defaultRole === "tenant"}
              />
              Locataire — je cherche une maison
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[#ebebeb] px-3 py-2.5 text-sm text-zinc-800">
              <input
                type="radio"
                name="role"
                value="owner"
                defaultChecked={defaultRole === "owner"}
              />
              Propriétaire — je publie des annonces
            </label>
          </fieldset>

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
