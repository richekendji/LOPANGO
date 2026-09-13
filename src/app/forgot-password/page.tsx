import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requestPasswordReset } from "@/app/actions/auth";
import { AuthQueryAlert } from "@/components/AuthQueryAlert";
import { PhoneInput } from "@/components/PhoneInput";
import { SubmitButton } from "@/components/SubmitButton";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Mot de passe oublié",
  description:
    "Réinitialisez votre mot de passe LOPANGO avec votre numéro et votre email de récupération.",
  path: "/forgot-password",
});

const ERRORS: Record<string, string> = {
  "invalid-email": "Adresse email invalide.",
  "invalid-phone": "Numéro invalide. Format : 06 ou 05 + 123 45 67.",
  config: "Configuration serveur incomplète.",
  "rate-limit": "Trop de tentatives. Réessayez plus tard.",
};

export default function ForgotPasswordPage() {
  const field =
    "w-full rounded-2xl border border-[#ebebeb] bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400";

  return (
    <div className="min-h-full bg-[#f5f5f5]">
      <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-10">
        <div className="text-center">
          <BrandLogo stacked withTagline size="lg" className="text-zinc-900" />
          <h1 className="mt-4 text-2xl font-bold text-zinc-900">
            Mot de passe oublié
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Indiquez votre numéro et l&apos;email de récupération enregistré à
            la création du compte. Le lien n&apos;est envoyé que si les deux
            correspondent.
          </p>
        </div>

        <Suspense>
          <AuthQueryAlert
            errors={ERRORS}
            successKey="sent"
            successText="Si un compte correspond, un message a été envoyé à cet email. Ouvrez-le pour choisir un nouveau mot de passe."
          />
        </Suspense>

        <form
          action={requestPasswordReset}
          className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm"
        >
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
          </label>

          <SubmitButton pendingLabel="Envoi…">Envoyer le lien</SubmitButton>
        </form>

        <p className="text-center text-sm text-zinc-500">
          <Link
            href="/login"
            prefetch
            className="font-semibold text-zinc-900 underline-offset-2 hover:underline"
          >
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
