"use client";

import { useEffect, useState } from "react";
import {
  createReclamation,
  getMyReclamations,
  type ReclamationRow,
} from "@/app/actions/reclamations";

const STATUS_LABEL: Record<
  string,
  { label: string; className: string }
> = {
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

export function InboxClient() {
  const [reclamations, setReclamations] = useState<ReclamationRow[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    void getMyReclamations().then(setReclamations);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSending(true);
    const fd = new FormData();
    fd.set("subject", subject);
    fd.set("message", message);
    const res = await createReclamation(fd);
    setSending(false);

    if (!res.ok) {
      setError(res.error ?? "Erreur. Réessaie.");
      return;
    }
    setSubject("");
    setMessage("");
    setSuccess(true);
    const fresh = await getMyReclamations();
    setReclamations(fresh);
  }

  const field =
    "w-full rounded-2xl border border-[#ebebeb] bg-white px-4 py-3 text-sm outline-none focus:border-zinc-400";

  return (
    <div className="px-4 pb-4">
      <h1 className="text-lg font-bold text-zinc-900">Réclamation</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Un problème avec une annonce, un démarcheur ou ton compte ? Écris-nous —
        l&apos;équipe LOPANGO te répond.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-5 space-y-3 rounded-[1.5rem] bg-white p-4 shadow-sm"
      >
        <p className="text-sm font-bold text-zinc-900">Nouvelle réclamation</p>
        <input
          className={field}
          placeholder="Objet (ex : une annonce utilise mes photos)"
          maxLength={120}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
        <textarea
          className={`${field} min-h-32`}
          placeholder="Explique ton problème (10 caractères minimum)…"
          maxLength={2000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
        {success && (
          <p className="text-xs font-semibold text-emerald-700">
            Réclamation envoyée ✅ L&apos;équipe te répondra ici.
          </p>
        )}
        <button
          type="submit"
          disabled={sending}
          className="w-full rounded-full bg-zinc-900 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {sending ? "Envoi…" : "Envoyer ma réclamation"}
        </button>
      </form>

      <div className="mt-6 space-y-3">
        <p className="text-sm font-bold text-zinc-900">Mes réclamations</p>
        {reclamations.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500">
            Aucune réclamation pour le moment.
          </p>
        ) : (
          reclamations.map((r) => {
            const st = STATUS_LABEL[r.status] ?? STATUS_LABEL.open;
            return (
              <article
                key={r.id}
                className="rounded-[1.5rem] bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-zinc-900">{r.subject}</p>
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
                  <div className="mt-3 rounded-2xl bg-zinc-50 p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">
                      Réponse LOPANGO
                    </p>
                    <p className="mt-1 text-sm text-zinc-700">{r.admin_reply}</p>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
