"use client";

import { useMemo, useState } from "react";
import {
  replyToReclamation,
  type ReclamationRow,
} from "@/app/actions/reclamations";

type Filter = "all" | "open" | "in_progress" | "resolved";

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  open: { label: "En attente", className: "bg-amber-50 text-amber-700" },
  in_progress: { label: "En cours", className: "bg-blue-50 text-blue-700" },
  resolved: { label: "Résolue", className: "bg-emerald-50 text-emerald-700" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminReclamationsBoard({
  reclamations,
}: {
  reclamations: ReclamationRow[];
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [replyFor, setReplyFor] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return reclamations.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false;
      if (!query) return true;
      return `${r.subject} ${r.message} ${r.author_name ?? ""} ${r.author_phone ?? ""}`
        .toLowerCase()
        .includes(query);
    });
  }, [reclamations, filter, q]);

  const counts = useMemo(() => {
    return {
      all: reclamations.length,
      open: reclamations.filter((r) => r.status === "open").length,
      in_progress: reclamations.filter((r) => r.status === "in_progress").length,
      resolved: reclamations.filter((r) => r.status === "resolved").length,
    };
  }, [reclamations]);

  async function sendReply(id: string, resolve: boolean) {
    setBusy(true);
    setError(null);
    const res = await replyToReclamation(id, reply, resolve);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Erreur.");
      return;
    }
    setReplyFor(null);
    setReply("");
    setDone(id);
    // Rechargement doux pour refléter le nouveau statut
    setTimeout(() => window.location.reload(), 600);
  }

  const field =
    "w-full rounded-2xl border border-[#ebebeb] bg-white px-4 py-3 text-sm outline-none focus:border-zinc-400";

  const tabs: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: "Toutes", count: counts.all },
    { id: "open", label: "En attente", count: counts.open },
    { id: "in_progress", label: "En cours", count: counts.in_progress },
    { id: "resolved", label: "Résolues", count: counts.resolved },
  ];

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setFilter(t.id)}
            className={[
              "rounded-full px-3 py-1.5 text-xs font-bold transition",
              filter === t.id
                ? "bg-zinc-900 text-white"
                : "bg-white text-zinc-600 shadow-sm",
            ].join(" ")}
          >
            {t.label} · {t.count}
          </button>
        ))}
      </div>

      <input
        className={field}
        placeholder="Rechercher (objet, nom, téléphone…)"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {list.length === 0 ? (
        <p className="rounded-2xl bg-white py-10 text-center text-sm text-zinc-500 shadow-sm">
          Aucune réclamation {filter === "all" ? "" : "dans ce filtre"}.
        </p>
      ) : (
        <div className="space-y-3">
          {list.map((r) => {
            const st = STATUS_LABEL[r.status] ?? STATUS_LABEL.open;
            return (
              <article
                key={r.id}
                className="rounded-[1.5rem] bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-zinc-900">
                      {r.subject}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {r.author_name ?? "Utilisateur"}
                      {r.author_phone ? ` · ${r.author_phone}` : ""}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${st.className}`}
                  >
                    {st.label}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-400">
                  {formatDate(r.created_at)}
                </p>
                <p className="mt-2 text-sm text-zinc-600">{r.message}</p>

                {r.admin_reply && (
                  <div className="mt-3 rounded-2xl bg-emerald-50/60 p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                      Ta réponse
                    </p>
                    <p className="mt-1 text-sm text-zinc-700">{r.admin_reply}</p>
                  </div>
                )}

                {replyFor === r.id ? (
                  <div className="mt-3 space-y-2">
                    <textarea
                      className={`${field} min-h-24`}
                      placeholder="Ta réponse à l'utilisateur…"
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                    />
                    {error && (
                      <p className="text-xs font-semibold text-red-600">
                        {error}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => sendReply(r.id, false)}
                        className="flex-1 rounded-full bg-zinc-900 py-2.5 text-xs font-bold text-white disabled:opacity-50"
                      >
                        Répondre (en cours)
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => sendReply(r.id, true)}
                        className="flex-1 rounded-full bg-emerald-600 py-2.5 text-xs font-bold text-white disabled:opacity-50"
                      >
                        Répondre + résoudre
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReplyFor(null);
                          setReply("");
                        }}
                        className="rounded-full border border-[#ebebeb] px-4 py-2.5 text-xs font-bold text-zinc-700"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setReplyFor(r.id)}
                    className="mt-3 rounded-full bg-zinc-900 px-4 py-2 text-xs font-bold text-white"
                  >
                    {r.admin_reply ? "Modifier la réponse" : "Répondre"}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
