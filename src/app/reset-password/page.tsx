import type { Metadata } from "next";
import { Suspense } from "react";
import { updatePassword } from "@/app/actions/auth";
import { AuthQueryAlert } from "@/components/AuthQueryAlert";
import { PasswordField } from "@/components/PasswordField";
import { SubmitButton } from "@/components/SubmitButton";
import { BrandLogo } from "@/components/brand/BrandLogo";
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

export default function ResetPasswordPage() {
  return (
    <div className="min-h-full bg-[#f5f5f5]">
      <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-10">
        <div className="text-center">
          <BrandLogo stacked withTagline size="lg" className="text-zinc-900" />
          <h1 className="mt-4 text-2xl font-bold text-zinc-900">
            Nouveau mot de passe
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Choisissez un nouveau mot de passe pour votre compte.
          </p>
        </div>

        <Suspense>
          <AuthQueryAlert errors={ERRORS} />
        </Suspense>

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

          <SubmitButton pendingLabel="Enregistrement…">
            Enregistrer et ouvrir l&apos;app
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
