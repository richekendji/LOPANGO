import Link from "next/link";
import { requestPasswordReset } from "@/app/actions/auth";

const ERRORS: Record<string, string> = {
  "invalid-email": "Adresse email invalide.",
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const params = await searchParams;

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
            Mot de passe oublié
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Indiquez l&apos;email de récupération choisi à l&apos;inscription.
            Vous recevrez un lien pour créer un nouveau mot de passe.
          </p>
        </div>

        {params.sent && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            Si un compte existe avec cet email, un message vient d&apos;être
            envoyé. Ouvrez-le pour réinitialiser votre mot de passe.
          </div>
        )}

        {params.error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {ERRORS[params.error] ?? params.error}
          </div>
        )}

        <form
          action={requestPasswordReset}
          className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm"
        >
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
          </label>

          <button
            type="submit"
            className="rounded-full bg-zinc-900 py-3.5 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Envoyer le lien
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          <Link
            href="/login"
            className="font-semibold text-zinc-900 underline-offset-2 hover:underline"
          >
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
