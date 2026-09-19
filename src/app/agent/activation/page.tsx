import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { activateAgentAccount } from "@/app/actions/auth";
import { AuthBackLink } from "@/components/AuthBackLink";
import { AuthQueryAlert } from "@/components/AuthQueryAlert";
import { PasswordField } from "@/components/PasswordField";
import { SubmitButton } from "@/components/SubmitButton";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { findAgentByPhone } from "@/lib/agents";
import { displayNormalizedPhone } from "@/lib/phone";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Activation démarcheur",
  description: "Créez votre mot de passe pour accéder à votre espace démarcheur LOPANGO.",
  path: "/agent/activation",
});

const ERRORS: Record<string, string> = {
  "invalid-phone": "Numéro invalide.",
  "not-agent": "Ce numéro n'est pas sur la liste des démarcheurs LOPANGO.",
  "weak-password": "Mot de passe trop court (8 caractères minimum).",
  "password-mismatch": "Les deux mots de passe ne correspondent pas.",
  "config": "Configuration serveur manquante. Contacte l'équipe.",
  "rate-limit": "Trop de tentatives. Réessaie plus tard.",
  "account-exists": "Un compte existe déjà avec ce numéro — connecte-toi normalement.",
  "signup-failed": "Impossible de créer le compte. Réessaie.",
};

export default async function AgentActivationPage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string; error?: string }>;
}) {
  const params = await searchParams;
  const phone = params.phone ?? "";
  const agent = await findAgentByPhone(phone);
  if (!agent) {
    // Numéro absent de la liste blanche → connexion classique
    redirect("/login");
  }

  return (
    <div className="min-h-full bg-[#f5f5f5]">
      <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-10">
        <AuthBackLink href="/login" />
        <div className="text-center">
          <BrandLogo size="lg" className="mx-auto" />
          <h1 className="mt-4 text-2xl font-bold text-zinc-900">
            Espace démarcheur
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Bienvenue ! Ton numéro{" "}
            <span className="font-semibold text-zinc-900">
              {displayNormalizedPhone(agent.phone)}
            </span>{" "}
            a été enregistré par l&apos;équipe LOPANGO.
            <br />
            Choisis un mot de passe pour activer ton compte.
          </p>
        </div>

        <Suspense>
          <AuthQueryAlert errors={ERRORS} />
        </Suspense>

        <form
          action={activateAgentAccount}
          className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm"
        >
          <input type="hidden" name="phone" value={agent.phone} />
          <input
            type="hidden"
            name="label"
            value={agent.label ?? ""}
          />

          <PasswordField
            name="password"
            label="Nouveau mot de passe"
            autoComplete="new-password"
            placeholder="8 caractères minimum"
          />
          <PasswordField
            name="passwordConfirm"
            label="Confirmer le mot de passe"
            autoComplete="new-password"
            placeholder="Ressaisis le mot de passe"
          />

          <SubmitButton pendingLabel="Activation…">
            Activer mon compte
          </SubmitButton>
        </form>

        <p className="text-center text-xs leading-relaxed text-zinc-400">
          Ton espace démarcheur te permet de publier des maisons gratuitement et
          de suivre tes gains dans l&apos;onglet Retirer.
        </p>
      </div>
    </div>
  );
}
