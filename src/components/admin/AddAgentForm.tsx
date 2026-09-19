"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addAgent } from "@/app/actions/agents";
import { PhoneInput } from "@/components/PhoneInput";
import { displayNormalizedPhone, normalizePhone } from "@/lib/phone";

export function AddAgentForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    const fd = new FormData(e.currentTarget);
    const phone = String(fd.get("phone") ?? "");
    const agency = String(fd.get("agency") ?? "").trim();

    if (!agency) {
      setBusy(false);
      setError("Le nom de l'agence est obligatoire.");
      return;
    }

    const res = await addAgent(phone, agency);
    setBusy(false);

    if (!res.ok) {
      setError(res.error ?? "Erreur d'enregistrement.");
      return;
    }

    const n = normalizePhone(phone);
    router.push(
      `/admin/agents?added=${encodeURIComponent(
        n ? displayNormalizedPhone(n) : phone,
      )}`,
    );
    router.refresh();
  }

  const field =
    "w-full rounded-2xl border border-[#ebebeb] bg-white px-4 py-3 text-sm outline-none focus:border-zinc-400";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="rounded-[1.5rem] bg-white p-4 shadow-sm space-y-4">
        <PhoneInput name="phone" />

        <label className="block space-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
            Nom de l&apos;agence
          </span>
          <input
            name="agency"
            className={field}
            placeholder="Ex. Agence Bacongo Habitat"
            maxLength={80}
            required
          />
          <p className="text-[11px] text-zinc-400">
            Affiché dans ton tableau admin et lié à ce numéro.
          </p>
        </label>
      </div>

      {error && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-zinc-900 py-3.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {busy ? "Enregistrement…" : "Ajouter le démarcheur"}
      </button>

      <Link
        href="/admin/agents"
        className="block w-full rounded-full border border-[#ebebeb] bg-white py-3 text-center text-sm font-semibold text-zinc-900"
      >
        Annuler
      </Link>
    </form>
  );
}
