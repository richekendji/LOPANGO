import Link from "next/link";
import { updatePassword } from "@/app/actions/auth";

const ERRORS: Record<string, string> = {
  "weak-password": "Le mot de passe doit contenir au moins 6 caractères.",
  "password-mismatch": "Les mots de passe ne correspondent pas.",
};

export default async function ResetPasswordPage({
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
        <div className="text-center">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-zinc-900"
          >
            LOPANGO
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-zinc-900">
            Nouveau mot de passe
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Choisissez un nouveau mot de passe pour votre compte.
          </p>
        </div>

        {params.error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {ERRORS[params.error] ?? params.error}
          </div>
        )}

        <form
          action={updatePassword}
          className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm"
        >
          <label className="block space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              Nouveau mot de passe
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
              Confirmer
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

          <button
            type="submit"
            className="rounded-full bg-zinc-900 py-3.5 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Enregistrer et ouvrir l&apos;app
          </button>
        </form>
      </div>
    </div>
  );
}
