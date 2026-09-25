import type { Metadata } from "next";
import Link from "next/link";
import { getAdminAgents } from "@/app/actions/agents";
import { AdminAgentsBoard } from "@/components/admin/AdminAgentsBoard";

export const metadata: Metadata = {
  title: "Démarcheurs",
  robots: { index: false, follow: false },
};

export default async function AdminAgentsPage({
  searchParams,
}: {
  searchParams: Promise<{ added?: string; edit?: string }>;
}) {
  const params = await searchParams;
  const agents = await getAdminAgents();

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-zinc-900">Démarcheurs</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Liste blanche — publication gratuite et accès à leurs propres
            annonces.
          </p>
        </div>
        <Link
          href="/admin/agents/new"
          aria-label="Ajouter un démarcheur"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-2xl font-light leading-none text-white shadow-sm"
        >
          +
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link
          href="/admin"
          className="flex w-full items-center justify-center rounded-2xl bg-white py-3 text-sm font-semibold text-zinc-900 shadow-sm"
        >
          ← Tableau de bord
        </Link>
        <Link
          href="/admin/reclamations"
          className="flex w-full items-center justify-center rounded-2xl bg-white py-3 text-sm font-semibold text-zinc-900 shadow-sm"
        >
          Réclamations
        </Link>
      </div>

      <AdminAgentsBoard
        agents={agents}
        addedLabel={params.added ?? null}
        editId={params.edit ?? null}
      />
    </div>
  );
}
