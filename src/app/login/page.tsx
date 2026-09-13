import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { signIn } from "@/app/actions/auth";
import { AuthBackLink } from "@/components/AuthBackLink";
import { AuthQueryAlert } from "@/components/AuthQueryAlert";
import { PasswordField } from "@/components/PasswordField";
import { PhoneInput } from "@/components/PhoneInput";
import { SubmitButton } from "@/components/SubmitButton";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { currentUserHomePath } from "@/lib/admin";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Connexion",
  description:
    "Connectez-vous à LOPANGO avec votre numéro et votre mot de passe pour trouver ou publier une maison au Congo.",
  path: "/login",
});

const ERRORS: Record<string, string> = {
  "missing-fields": "Veuillez remplir tous les champs.",
  "invalid-phone": "Numéro invalide. Format : 06 ou 05 + 123 45 67.",
  "bad-credentials": "Numéro ou mot de passe incorrect.",
  "reset-link-invalid": "Lien de réinitialisation invalide ou expiré.",
  "rate-limit": "Trop de tentatives. Réessayez plus tard.",
};

export default async function LoginPage() {
  const home = await currentUserHomePath();
  if (home) redirect(home);

  return (
    <div className="min-h-full bg-[#f5f5f5]">
      <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-10">
        <AuthBackLink href="/" />
        <div className="text-center">
          <BrandLogo stacked withTagline size="lg" className="text-zinc-900" />
          <h1 className="mt-4 text-2xl font-bold text-zinc-900">Connexion</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Numéro + mot de passe uniquement.
          </p>
        </div>

        <Suspense>
          <AuthQueryAlert errors={ERRORS} />
        </Suspense>

        <form
          action={signIn}
          className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm"
        >
          <PhoneInput />

          <PasswordField
            name="password"
            label="Mot de passe"
            autoComplete="current-password"
            placeholder="Votre mot de passe"
          />

          <div className="text-right">
            <Link
              href="/forgot-password"
              prefetch
              className="text-sm font-semibold text-zinc-700 underline-offset-2 hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <SubmitButton pendingLabel="Connexion…">Se connecter</SubmitButton>
        </form>

        <p className="text-center text-sm text-zinc-500">
          Pas encore de compte ?{" "}
          <Link
            href="/register"
            prefetch
            className="font-semibold text-zinc-900 underline-offset-2 hover:underline"
          >
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
