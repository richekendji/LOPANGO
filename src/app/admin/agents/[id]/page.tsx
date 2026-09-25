import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { displayNormalizedPhone } from "@/lib/phone";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Démarcheur",
  description: "Maisons publiées par un démarcheur LOPANGO.",
  path: "/admin/agents",
});

export const dynamic = "force-dynamic";

type AgentHouseRow = {
  house_id: string;
  title: string | null;
  price: number | null;
  city: string | null;
  neighborhood: string | null;
  contact_phone: string | null;
  published_at: string | null;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const admin = createAdminClient();
  const { data: agent } = await admin
    .from("agents")
    .select("id, phone, email, label, active, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!agent) {
    redirect("/admin/agents");
  }

  const { data: houses } = await admin
    .from("agent_houses")
    .select(
      "house_id, title, price, city, neighborhood, contact_phone, published_at",
    )
    .eq("agent_id", id)
    .order("published_at", { ascending: false });

  const list = (houses ?? []) as AgentHouseRow[];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/admin/agents"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-semibold shadow-sm"
        >
          ←
        </Link>
        <Link
          href={`/admin/agents?edit=${id}`}
          className="rounded-full border border-[#ebebeb] bg-white px-4 py-2 text-xs font-semibold text-zinc-900 shadow-sm"
        >
          Modifier
        </Link>
      </div>

      {/* Fiche démarcheur */}
      <article className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-zinc-900">
              {agent.label || "Agence"}
            </h1>
            <p className="text-sm text-zinc-600">
              {displayNormalizedPhone(agent.phone)}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-zinc-500">
              {agent.email ? `✉️ ${agent.email}` : "✉️ Pas d'email"}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
              agent.active
                ? "bg-emerald-50 text-emerald-700"
                : "bg-zinc-100 text-zinc-500"
            }`}
          >
            {agent.active ? "Actif" : "Désactivé"}
          </span>
        </div>
      </article>

      {/* Toutes ses maisons publiées */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-zinc-900">
            Maisons publiées ({list.length})
          </p>
        </div>

        {list.length === 0 ? (
          <p className="rounded-2xl bg-white py-10 text-center text-sm text-zinc-500 shadow-sm">
            Aucune maison publiée pour le moment.
          </p>
        ) : (
          list.map((h) => (
            <article
              key={h.house_id}
              className="rounded-2xl bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-bold text-zinc-900">
                    {h.title || `Annonce #${h.house_id.slice(0, 8)}`}
                  </p>
                  <p className="mt-0.5 text-[13px] text-zinc-500">
                    {[h.neighborhood, h.city].filter(Boolean).join(", ") || "—"}
                  </p>
                  {h.price ? (
                    <p className="mt-1 text-[15px] font-bold tabular-nums text-zinc-900">
                      {h.price.toLocaleString("fr-FR")} FCFA
                      <span className="text-xs font-normal text-zinc-500">
                        {" "}
                        /mois
                      </span>
                    </p>
                  ) : null}
                  <p className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-zinc-400">
                    {h.contact_phone && (
                      <span>☎ {displayNormalizedPhone(h.contact_phone)}</span>
                    )}
                    {h.published_at && (
                      <span>Publié le {formatDate(h.published_at)}</span>
                    )}
                  </p>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}