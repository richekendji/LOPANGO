import type { Metadata } from "next";
import Link from "next/link";
import {
  getAdminAgents,
  getAdminWithdrawals,
} from "@/app/actions/agents";
import { AdminAgentsBoard } from "@/components/admin/AdminAgentsBoard";

export const metadata: Metadata = {
  title: "Démarcheurs",
  robots: { index: false, follow: false },
};

export default async function AdminAgentsPage() {
  const [agents, withdrawals] = await Promise.all([
    getAdminAgents(),
    getAdminWithdrawals(),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-zinc-900">Démarcheurs</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Liste blanche, commissions (4 500 / 1ʳᵉ conversion par annonce) et
          retraits à valider.
        </p>
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

      <AdminAgentsBoard agents={agents} withdrawals={withdrawals} />
    </div>
  );
}
