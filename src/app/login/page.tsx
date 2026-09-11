import Link from "next/link";
import { signIn } from "@/app/actions/auth";
import { AuthBackLink } from "@/components/AuthBackLink";
import { PhoneInput } from "@/components/PhoneInput";

const ERRORS: Record<string, string> = {
  "missing-fields": "Veuillez remplir tous les champs.",
  "invalid-phone": "Numéro invalide. Format : 06 ou 05 + 123 45 67.",
  "bad-credentials": "Numéro ou mot de passe incorrect.",
  "reset-link-invalid": "Lien de réinitialisation invalide ou expiré.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

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
          <h1 className="mt-4 text-2xl font-bold text-zinc-900">Connexion</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Numéro + mot de passe uniquement.
          </p>
        </div>

        {params.error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {ERRORS[params.error] ?? "Une erreur est survenue."}
          </div>
        )}

        <form
          action={signIn}
          className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm"
        >
          <PhoneInput />

          <label className="block space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              Mot de passe
            </span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className={field}
              placeholder="Votre mot de passe"
            />
          </label>

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-zinc-700 underline-offset-2 hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <button
            type="submit"
            className="rounded-full bg-zinc-900 py-3.5 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Se connecter
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          Pas encore de compte ?{" "}
          <Link
            href="/register"
            className="font-semibold text-zinc-900 underline-offset-2 hover:underline"
          >
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
