"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  deleteAgent,
  setAgentActive,
  updateAgent,
  type AgentAdminRow,
} from "@/app/actions/agents";
import { displayNormalizedPhone } from "@/lib/phone";

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
  addedLabel,
  editId,
}: {
  agents: AgentAdminRow[];
  addedLabel?: string | null;
  editId?: string | null;
}) {
  const router = useRouter();
  // Liste locale : les modifications s'affichent immédiatement,
  // sans rechargement de page (qui rouvrait le formulaire via ?edit=).
  const [list, setList] = useState(agents);
  const [busyId, setBusyId] = useState<string | null>(null);
  const initialAgent = editId
    ? (agents.find((a) => a.id === editId) ?? null)
    : null;
  const [editFor, setEditFor] = useState<string | null>(
    initialAgent?.id ?? null,
  );
  const [editLabel, setEditLabel] = useState(initialAgent?.label ?? "");
  const [editEmail, setEditEmail] = useState(initialAgent?.email ?? "");
  const [editError, setEditError] = useState<string | null>(null);
  const [editBusy, setEditBusy] = useState(false);
  const [editSaved, setEditSaved] = useState(false);

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

  function openEdit(a: AgentAdminRow) {
    setEditFor(a.id);
    setEditLabel(a.label || "");
    setEditEmail(a.email || "");
    setEditError(null);
  }

  async function saveEdit(id: string) {
    if (editBusy) return;
    setEditBusy(true);
    setEditError(null);
    try {
      const res = await updateAgent(id, {
        label: editLabel,
        email: editEmail,
      });
      if (!res.ok) {
        setEditError(res.error ?? "Erreur d'enregistrement.");
        return;
      }
      // Mise à jour locale : le formulaire se replie et la carte affiche
      // les nouvelles valeurs + confirmation — sans rechargement.
      setList((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                label: editLabel.trim() || a.label,
                email: editEmail.trim() || null,
              }
            : a,
        ),
      );
      setEditFor(null);
      setEditSaved(true);
      setTimeout(() => setEditSaved(false), 2500);
      // Nettoie ?edit= de l'URL pour ne pas rouvrir le formulaire.
      router.replace("/admin/agents", { scroll: false });
    } catch {
      setEditError("Erreur réseau. Réessaie.");
    } finally {
      setEditBusy(false);
    }
  }

  const field =
    "w-full rounded-2xl border border-[#ebebeb] bg-white px-4 py-3 text-sm outline-none focus:border-zinc-400";

  return (
    <div className="space-y-6">
      {addedLabel && (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          Démarcheur {addedLabel} ajouté ✅ Il peut se connecter avec ce numéro.
        </p>
      )}

      {/* Bouton + bien visible */}
      <Link
        href="/admin/agents/new"
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-4 text-sm font-semibold text-white shadow-sm"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-lg leading-none">
          +
        </span>
        Ajouter un démarcheur
      </Link>

      {/* Liste des démarcheurs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-zinc-900">
            Mes démarcheurs ({list.length})
          </p>
        </div>
        {editSaved && (
          <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            Modifications enregistrées ✅
          </p>
        )}
        {list.length === 0 ? (
          <p className="rounded-2xl bg-white py-8 text-center text-sm text-zinc-500 shadow-sm">
            Aucun démarcheur. Appuie sur « + » pour en ajouter un.
          </p>
        ) : (
          list.map((a) => (
            <article
              key={a.id}
              className="rounded-2xl bg-white p-4 shadow-sm"
            >
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
                  <p className="mt-0.5 text-[11px] text-zinc-400">
                    Ajouté le {formatDate(a.created_at)}
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

              {editFor === a.id ? (
                <div className="mt-3 space-y-2 border-t border-[#ebebeb] pt-3">
                  <input
                    className={field}
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    placeholder="Nom de l'agence"
                    maxLength={80}
                  />
                  <input
                    className={field}
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="Email (commission reçue)"
                    maxLength={120}
                  />
                  {editError && (
                    <p className="text-xs font-semibold text-red-600">
                      {editError}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={editBusy}
                      onClick={() => saveEdit(a.id)}
                      className="flex-1 rounded-full bg-zinc-900 py-2 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      {editBusy ? "…" : "Enregistrer"}
                    </button>
                    <button
                      type="button"
                      disabled={editBusy}
                      onClick={() => setEditFor(null)}
                      className="flex-1 rounded-full border border-[#ebebeb] bg-white py-2 text-xs font-semibold text-zinc-900"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={busyId === a.id}
                    onClick={() => openEdit(a)}
                    className="flex-1 rounded-full border border-[#ebebeb] bg-white py-2 text-xs font-semibold text-zinc-900"
                  >
                    Modifier
                  </button>
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
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
}