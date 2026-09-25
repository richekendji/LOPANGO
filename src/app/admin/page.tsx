import Link from "next/link";
import { adminStats, getAdminUsers } from "@/lib/admin";
import { AdminUsersBoard } from "@/components/admin/AdminUsersBoard";
import { getAdminAgents } from "@/app/actions/agents";
import { displayNormalizedPhone } from "@/lib/phone";

export default async function AdminPage() {
  const [users, agents] = await Promise.all([
    getAdminUsers(),
    getAdminAgents(),
  ]);
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

      <div className="grid grid-cols-2 gap-2">
        <Link
          href="/admin/reclamations"
          className="flex w-full items-center justify-center rounded-2xl bg-white py-3 text-sm font-semibold text-zinc-900 shadow-sm"
        >
          Réclamations
        </Link>
        <Link
          href="/admin/agents/new"
          className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-zinc-900 py-3 text-sm font-semibold text-white shadow-sm"
        >
          <span className="text-lg leading-none">+</span>
          Démarcheur
        </Link>
      </div>

      {/* Catégorie Démarcheurs — liste complète + édition (label, email) */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-zinc-900">
            Démarcheurs ({agents.length})
          </p>
          <Link
            href="/admin/agents"
            className="text-xs font-semibold text-zinc-500"
          >
            Tout gérer →
          </Link>
        </div>
        {agents.length === 0 ? (
          <p className="rounded-2xl bg-white py-6 text-center text-sm text-zinc-500 shadow-sm">
            Aucun démarcheur. Appuie sur « + » pour en ajouter un.
          </p>
        ) : (
          agents.map((a) => (
            <article key={a.id} className="rounded-2xl bg-white p-4 shadow-sm">
              {/* Clic sur le démarcheur → son espace avec toutes ses maisons */}
              <Link
                href={`/admin/agents/${a.id}`}
                className="flex items-start justify-between gap-3 active:opacity-70"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-zinc-900">
                    {a.label || "Agence"}
                  </p>
                  <p className="text-sm text-zinc-600">
                    {displayNormalizedPhone(a.phone)}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-zinc-500">
                    {a.email ? `✉️ ${a.email}` : "✉️ Pas d'email"}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-zinc-500">
                    Voir ses maisons →
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    a.active
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {a.active ? "Actif" : "Désactivé"}
                </span>
              </Link>
              <Link
                href={`/admin/agents?edit=${a.id}`}
                className="mt-3 flex w-full items-center justify-center rounded-full border border-[#ebebeb] bg-white py-2 text-xs font-semibold text-zinc-900"
              >
                Modifier (nom, email)
              </Link>
            </article>
          ))
        )}
      </section>

      <div className="grid grid-cols-1 gap-2">
        <Link
          href="/app"
          className="flex w-full items-center justify-center rounded-2xl bg-white py-3 text-sm font-semibold text-zinc-900 shadow-sm"
        >
          Voir le feed des maisons
        </Link>
      </div>

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
