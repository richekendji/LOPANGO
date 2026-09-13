import Link from "next/link";
import { adminStats, getAdminUsers } from "@/lib/admin";
import { AdminUsersBoard } from "@/components/admin/AdminUsersBoard";

export default async function AdminPage() {
  const users = await getAdminUsers();
  const stats = adminStats(users);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-zinc-900">Maison à louer</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Qui cherche, qui publie — les comptes LOPANGO.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Comptes" value={stats.total} />
        <StatCard label="Abonnés" value={stats.paid} tone="paid" />
        <StatCard label="Gratuit" value={stats.free} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Locataires" value={stats.tenants} />
        <StatCard label="Propriétaires" value={stats.owners} />
      </div>

      <Link
        href="/app"
        className="flex w-full items-center justify-center rounded-2xl bg-white py-3 text-sm font-semibold text-zinc-900 shadow-sm"
      >
        Voir le feed des maisons
      </Link>

      <AdminUsersBoard users={users} />
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "paid";
}) {
  return (
    <div className="rounded-2xl bg-white px-3 py-4 text-center shadow-sm">
      <p
        className={`text-2xl font-black tracking-tight ${
          tone === "paid" ? "text-emerald-700" : "text-zinc-900"
        }`}
      >
        {value}
      </p>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
        {label}
      </p>
    </div>
  );
}
