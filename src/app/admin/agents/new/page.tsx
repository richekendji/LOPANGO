import type { Metadata } from "next";
import Link from "next/link";
import { AddAgentForm } from "@/components/admin/AddAgentForm";

export const metadata: Metadata = {
  title: "Ajouter un démarcheur",
  robots: { index: false, follow: false },
};

export default function AdminAddAgentPage() {
  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/agents"
          className="text-sm font-semibold text-zinc-500"
        >
          ← Retour aux démarcheurs
        </Link>
        <h1 className="mt-3 text-lg font-bold text-zinc-900">
          Ajouter un démarcheur
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Saisis son numéro et le nom de son agence. Il pourra ensuite se
          connecter avec ce numéro et créer son mot de passe.
        </p>
      </div>

      <AddAgentForm />
    </div>
  );
}
