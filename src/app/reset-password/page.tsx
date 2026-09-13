import type { Metadata } from "next";
import Link from "next/link";
import { updatePassword } from "@/app/actions/auth";
import { PasswordField } from "@/components/PasswordField";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Nouveau mot de passe",
  description:
    "Choisissez un nouveau mot de passe pour votre compte LOPANGO.",
  path: "/reset-password",
});

const ERRORS: Record<string, string> = {
  "weak-password": "Le mot de passe doit contenir au moins 8 caractères.",
  "password-mismatch": "Les mots de passe ne correspondent pas.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

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
            {ERRORS[params.error] ?? "Une erreur est survenue."}
          </div>
        )}

        <form
          action={updatePassword}
          className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm"
        >
          <PasswordField
            name="password"
            label="Nouveau mot de passe"
            autoComplete="new-password"
            minLength={8}
            placeholder="Au moins 8 caractères"
          />

          <PasswordField
            name="passwordConfirm"
            label="Confirmer"
            autoComplete="new-password"
            minLength={8}
            placeholder="Retapez le mot de passe"
          />

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
