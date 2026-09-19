"use client";

import { useState } from "react";
import {
  addAgent,
  deleteAgent,
  processWithdrawal,
  setAgentActive,
  type AgentAdminRow,
  type AdminWithdrawalRow,
} from "@/app/actions/agents";
import { displayNormalizedPhone, normalizePhone } from "@/lib/phone";

const W_STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: "En attente", className: "bg-amber-50 text-amber-700" },
  approved: { label: "Payé", className: "bg-emerald-50 text-emerald-700" },
  rejected: { label: "Refusé", className: "bg-red-50 text-red-700" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminAgentsBoard({
  agents,
  withdrawals,
}: {
  agents: AgentAdminRow[];
  withdrawals: AdminWithdrawalRow[];
}) {
  // --- Ajout d'un démarcheur ---
  const [phone, setPhone] = useState("+242 ");
  const [label, setLabel] = useState("");
  const [addBusy, setAddBusy] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addOk, setAddOk] = useState<string | null>(null);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError(null);
    setAddOk(null);
    setAddBusy(true);
    const res = await addAgent(phone, label);
    setAddBusy(false);
    if (!res.ok) {
      setAddError(res.error ?? "Erreur.");
      return;
    }
    const n = normalizePhone(phone);
    setAddOk(
      `Démarcheur ${n ? displayNormalizedPhone(n) : phone} ajouté ✅ Il peut maintenant se connecter avec ce numéro.`,
    );
    setPhone("+242 ");
    setLabel("");
    setTimeout(() => window.location.reload(), 900);
  }

  // --- Actions sur un agent ---
  const [busyId, setBusyId] = useState<string | null>(null);

  async function toggleAgent(id: string, active: boolean) {
    setBusyId(id);
    await setAgentActive(id, active);
    setBusyId(null);
    setTimeout(() => window.location.reload(), 300);
  }

  async function removeAgent(id: string) {
    if (!window.confirm("Supprimer définitivement ce démarcheur ?")) return;
    setBusyId(id);
    await deleteAgent(id);
    setBusyId(null);
    setTimeout(() => window.location.reload(), 300);
  }

  // --- Validation des retraits ---
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [wdBusy, setWdBusy] = useState(false);

  async function decide(id: string, approve: boolean) {
    setWdBusy(true);
    await processWithdrawal(id, approve, note);
    setWdBusy(false);
    setNoteFor(null);
    setNote("");
    setTimeout(() => window.location.reload(), 300);
  }

  const pendingCount = withdrawals.filter((w) => w.status === "pending").length;
  const totalCommissions = agents.reduce((a, x) => a + x.total_earnings, 0);

  const field =
    "w-full rounded-2xl border border-[#ebebeb] bg-white px-4 py-3 text-sm outline-none focus:border-zinc-400";

  return (
    <div className="space-y-6">
      {/* Ajouter un démarcheur */}
      <form
        onSubmit={onAdd}
        className="space-y-3 rounded-[1.5rem] bg-white p-4 shadow-sm"
      >
        <p className="text-sm font-bold text-zinc-900">
          Ajouter un démarcheur
        </p>
        <p className="text-xs text-zinc-500">
          Son numéro pourra se connecter dès son premier essai : on lui demandera
          de créer un mot de passe. Il publie gratuitement, gagne 4 500 FCFA par
          annonce qui génère un premier abonné payant.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            type="tel"
            className={field}
            placeholder="+242 06 123 45 67"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <input
            className={field}
            placeholder="Nom / repère (optionnel)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            maxLength={60}
          />
        </div>
        {addError && (
          <p className="text-xs font-semibold text-red-600">{addError}</p>
        )}
        {addOk && (
          <p className="text-xs font-semibold text-emerald-700">{addOk}</p>
        )}
        <button
          type="submit"
          disabled={addBusy}
          className="w-full rounded-full bg-zinc-900 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {addBusy ? "Ajout…" : "Ajouter à la liste blanche"}
        </button>
      </form>

      {/* Liste des démarcheurs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-zinc-900">
            Mes démarcheurs ({agents.length})
          </p>
          <p className="text-xs font-semibold text-zinc-500">
            {totalCommissions.toLocaleString("fr-FR")} FCFA de commissions
          </p>
        </div>
        {agents.length === 0 ? (
          <p className="rounded-2xl bg-white py-8 text-center text-sm text-zinc-500 shadow-sm">
            Aucun démarcheur pour le moment.
          </p>
        ) : (
          agents.map((a) => (
            <article
              key={a.id}
              className="rounded-2xl bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-zinc-900">
                    {a.label || "Démarcheur"}
                  </p>
                  <p className="text-sm text-zinc-600">
                    {displayNormalizedPhone(a.phone)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-zinc-400">
                    Ajouté le {formatDate(a.created_at)} ·{" "}
                    {a.total_earnings.toLocaleString("fr-FR")} FCFA gagnés
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
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={busyId === a.id}
                  onClick={() => toggleAgent(a.id, !a.active)}
                  className="flex-1 rounded-full border border-[#ebebeb] bg-white py-2 text-xs font-semibold text-zinc-900"
                >
                  {a.active ? "Désactiver" : "Réactiver"}
                </button>
                <button
                  type="button"
                  disabled={busyId === a.id}
                  onClick={() => removeAgent(a.id)}
                  className="flex-1 rounded-full bg-red-50 py-2 text-xs font-semibold text-red-700"
                >
                  Supprimer
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Demandes de retrait */}
      <div className="space-y-3">
        <p className="text-sm font-bold text-zinc-900">
          Demandes de retrait{" "}
          {pendingCount > 0 && (
            <span className="ml-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
              {pendingCount} en attente
            </span>
          )}
        </p>
        {withdrawals.length === 0 ? (
          <p className="rounded-2xl bg-white py-8 text-center text-sm text-zinc-500 shadow-sm">
            Aucune demande de retrait.
          </p>
        ) : (
          withdrawals.map((w) => {
            const st = W_STATUS[w.status] ?? W_STATUS.pending;
            return (
              <article
                key={w.id}
                className="rounded-2xl bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-zinc-900">
                      {formatFcfaSafe(w.amount)}
                    </p>
                    <p className="text-sm text-zinc-600">
                      {w.agent_label || "Démarcheur"} ·{" "}
                      {w.agent_phone
                        ? displayNormalizedPhone(w.agent_phone)
                        : "?"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-zinc-400">
                      {formatDate(w.created_at)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${st.className}`}
                  >
                    {st.label}
                  </span>
                </div>

                {w.status === "pending" ? (
                  noteFor === w.id ? (
                    <div className="mt-3 space-y-2 border-t border-[#ebebeb] pt-3">
                      <input
                        className={field}
                        placeholder="Note (optionnel — ex : envoyé via MTN MoMo)"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        maxLength={200}
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={wdBusy}
                          onClick={() => decide(w.id, true)}
                          className="flex-1 rounded-full bg-emerald-600 py-2.5 text-xs font-semibold text-white disabled:opacity-50"
                        >
                          {wdBusy ? "…" : "Valider (payé)"}
                        </button>
                        <button
                          type="button"
                          disabled={wdBusy}
                          onClick={() => decide(w.id, false)}
                          className="flex-1 rounded-full bg-red-50 py-2.5 text-xs font-semibold text-red-700 disabled:opacity-50"
                        >
                          Refuser
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setNoteFor(w.id);
                        setNote("");
                      }}
                      className="mt-3 w-full rounded-full bg-zinc-900 py-2.5 text-xs font-semibold text-white"
                    >
                      Traiter cette demande
                    </button>
                  )
                ) : w.admin_note ? (
                  <p className="mt-2 text-xs text-zinc-500">
                    Note : {w.admin_note}
                  </p>
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

function formatFcfaSafe(n: number) {
  return `${Math.round(n).toLocaleString("fr-FR")} FCFA`;
}
