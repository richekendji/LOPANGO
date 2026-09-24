"use client";

import { useEffect, useState } from "react";
import {
  getMyAgentEarnings,
  requestWithdrawal,
  type AgentEarningsData,
} from "@/app/actions/agents";
import { formatFcfa } from "@/lib/mock/houses";

const W_STATUS: Record<
  string,
  { label: string; className: string }
> = {
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

export function AgentGainsClient() {
  const [data, setData] = useState<AgentEarningsData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    void getMyAgentEarnings().then((res) => {
      if (!res.ok || !res.data) {
        setLoadError(res.error ?? "Erreur de chargement.");
        return;
      }
      setData(res.data);
    });
  }, []);

  async function onWithdraw(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setBusy(true);
    const res = await requestWithdrawal(Number(amount));
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Erreur. Réessaie.");
      return;
    }
    setSuccess("Demande envoyée ✅ L'équipe LOPANGO va la traiter.");
    setAmount("");
    const fresh = await getMyAgentEarnings();
    if (fresh.ok && fresh.data) setData(fresh.data);
  }

  if (loadError) {
    return (
      <div className="px-4 pb-4">
        <p className="rounded-2xl bg-white p-4 text-sm text-zinc-500 shadow-sm">
          Impossible de charger tes gains. Recharge la page.
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="px-4 pb-4">
        <p className="text-sm text-zinc-500">Chargement de tes gains…</p>
      </div>
    );
  }

  const field =
    "w-full rounded-2xl border border-[#ebebeb] bg-white px-4 py-3 text-sm outline-none focus:border-zinc-400";

  return (
    <div className="px-4 pb-4">
      <h1 className="text-lg font-bold text-zinc-900">Mes gains</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Tu gagnes {formatFcfa(5000)} quand un abonné payant arrive grâce à
        l&apos;une de tes annonces — la première fois seulement. Les opérateurs
        Mobile Money prennent {formatFcfa(500)} sur la transaction : il te reste{" "}
        {formatFcfa(4500)}.
      </p>

      {/* Compteurs */}
      <div className="mt-5 grid grid-cols-2 gap-2">
        <div className="col-span-2 rounded-2xl bg-zinc-900 px-4 py-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
            Solde retirable
          </p>
          <p className="mt-1 text-3xl font-black tabular-nums tracking-tight">
            {formatFcfa(data.balance)}
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            {formatFcfa(5000)} par annonce convertie, moins {formatFcfa(500)}{" "}
            de frais opérateur — jamais les frais d&apos;abonnement.
          </p>
        </div>
        <StatCard label="Total gagné" value={data.total} />
        <StatCard label="Déjà payé" value={data.paid} tone="paid" />
      </div>
      {data.pending > 0 && (
        <p className="mt-2 text-center text-xs font-semibold text-amber-700">
          {formatFcfa(data.pending)} en attente de validation
        </p>
      )}

      {/* Demande de retrait */}
      <form
        onSubmit={onWithdraw}
        className="mt-5 space-y-3 rounded-[1.5rem] bg-white p-4 shadow-sm"
      >
        <p className="text-sm font-bold text-zinc-900">Demander un retrait</p>
        <p className="text-xs text-zinc-500">
          Minimum {formatFcfa(1000)}. L&apos;équipe valide chaque demande
          manuellement puis t&apos;envoie l&apos;argent par Mobile Money.
        </p>
        <input
          type="number"
          inputMode="numeric"
          min={1000}
          step={1}
          className={field}
          placeholder={`Montant (max ${data.balance})`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
        {success && (
          <p className="text-xs font-semibold text-emerald-700">{success}</p>
        )}
        <button
          type="submit"
          disabled={busy || data.balance < 1000}
          className="w-full rounded-full bg-zinc-900 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy
            ? "Envoi…"
            : data.balance < 1000
              ? `Solde insuffisant (min. ${formatFcfa(1000)})`
              : "Demander le retrait"}
        </button>
      </form>

      {/* Historique des commissions */}
      <div className="mt-6 space-y-3">
        <p className="text-sm font-bold text-zinc-900">
          Mes commissions ({data.earnings.length})
        </p>
        {data.earnings.length === 0 ? (
          <p className="rounded-2xl bg-white py-8 text-center text-sm text-zinc-500 shadow-sm">
            Aucune commission pour le moment. Publie des maisons : dès qu&apos;un
            abonné payant provient de ton annonce, tu gagnes {formatFcfa(5000)}{" "}
            (moins {formatFcfa(500)} pris par les opérateurs).
          </p>
        ) : (
          data.earnings.map((e) => (
            <article
              key={e.id}
              className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-900">
                  Annonce #{e.house_id.slice(0, 8)}
                </p>
                <p className="text-[11px] text-zinc-400">
                  {formatDate(e.created_at)}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                +{formatFcfa(e.amount)}
              </span>
            </article>
          ))
        )}
      </div>

      {/* Historique des retraits */}
      {data.withdrawals.length > 0 && (
        <div className="mt-6 space-y-3">
          <p className="text-sm font-bold text-zinc-900">Mes retraits</p>
          {data.withdrawals.map((w) => {
            const st = W_STATUS[w.status] ?? W_STATUS.pending;
            return (
              <article
                key={w.id}
                className="rounded-2xl bg-white px-4 py-3 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold tabular-nums text-zinc-900">
                    {formatFcfa(w.amount)}
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${st.className}`}
                  >
                    {st.label}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-zinc-400">
                  {formatDate(w.created_at)}
                </p>
                {w.admin_note && (
                  <p className="mt-2 text-xs text-zinc-600">
                    Note de l&apos;équipe : {w.admin_note}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
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
    <div className="rounded-2xl bg-white px-3 py-3 text-center shadow-sm">
      <p
        className={`text-xl font-black tabular-nums tracking-tight ${
          tone === "paid" ? "text-emerald-700" : "text-zinc-900"
        }`}
      >
        {formatFcfa(value)}
      </p>
      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
        {label}
      </p>
    </div>
  );
}
