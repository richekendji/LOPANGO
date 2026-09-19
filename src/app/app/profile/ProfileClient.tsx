"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { CITIES } from "@/lib/mock/houses";
import {
  getProfile,
  saveProfile,
  subscribeStore,
  type UserProfile,
  type UserRole,
} from "@/lib/mock/store";
import { SelectField } from "@/components/SelectField";

export function ProfileClient() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<UserProfile | null>(null);
  const [saved, setSaved] = useState(false);
  const [isAgent, setIsAgent] = useState(false);

  useEffect(() => {
    const refresh = () => {
      const p = getProfile();
      setProfile(p);
      setForm(p);
    };
    refresh();
    fetch("/api/agent/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { agent?: boolean } | null) => setIsAgent(Boolean(d?.agent)))
      .catch(() => setIsAgent(false));
    return subscribeStore(refresh);
  }, []);

  if (!profile || !form) {
    return (
      <div className="py-10 text-center text-sm text-zinc-500">
        Chargement…
      </div>
    );
  }

  const initials =
    `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();

  const field =
    "w-full rounded-2xl border border-[#ebebeb] bg-white px-4 py-3 text-sm outline-none focus:border-zinc-400";

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    const next: UserProfile = {
      ...form,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
    };
    saveProfile(next);
    setProfile(next);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <div className="mt-4 rounded-2xl bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-lg font-bold text-white">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold text-zinc-900">
              {profile.firstName} {profile.lastName}
            </p>
            <p className="truncate font-mono text-xs text-zinc-500">
              @{profile.username}
            </p>
            <span className="mt-1.5 inline-block rounded-full bg-[#f5f5f5] px-2.5 py-0.5 text-[11px] font-semibold text-zinc-700">
              {profile.role === "owner" ? "Propriétaire" : "Locataire"}
            </span>
          </div>
        </div>

        {!editing && (
          <dl className="mt-4 space-y-2.5 border-t border-[#ebebeb] pt-3">
            <div className="flex justify-between gap-3 text-sm">
              <dt className="text-zinc-400">Téléphone</dt>
              <dd className="font-medium text-zinc-900">{profile.phone}</dd>
            </div>
            <div className="flex justify-between gap-3 text-sm">
              <dt className="text-zinc-400">Ville</dt>
              <dd className="font-medium text-zinc-900">{profile.city}</dd>
            </div>
          </dl>
        )}

        {saved && (
          <p className="mt-3 text-center text-xs font-semibold text-emerald-600">
            Profil enregistré
          </p>
        )}
      </div>

      {editing ? (
        <form
          onSubmit={onSave}
          className="mt-3 space-y-3 rounded-2xl bg-white p-4 shadow-sm"
        >
          <p className="text-sm font-bold text-zinc-900">Modifier le profil</p>
          <div className="grid grid-cols-2 gap-2">
            <label className="block space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                Prénom
              </span>
              <input
                className={field}
                required
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                Nom
              </span>
              <input
                className={field}
                required
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </label>
          </div>
          <label className="block space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              Téléphone
            </span>
            <input
              type="tel"
              className={field}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+242 06 000 00 00"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              Ville
            </span>
            <SelectField
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </SelectField>
          </label>
          <fieldset className="space-y-2">
            <legend className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              Je suis
            </legend>
            {(
              [
                { value: "tenant", label: "Locataire — je cherche une maison" },
                {
                  value: "owner",
                  label: "Propriétaire — je publie des annonces",
                },
              ] as { value: UserRole; label: string }[]
            ).map((opt) => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[#ebebeb] px-3 py-2.5 text-sm text-zinc-800"
              >
                <input
                  type="radio"
                  name="role"
                  checked={form.role === opt.value}
                  onChange={() => setForm({ ...form, role: opt.value })}
                />
                {opt.label}
              </label>
            ))}
          </fieldset>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 rounded-full bg-zinc-900 py-3 text-sm font-semibold text-white"
            >
              Enregistrer
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(profile);
                setEditing(false);
              }}
              className="rounded-full border border-[#ebebeb] px-4 py-3 text-sm font-semibold text-zinc-700"
            >
              Annuler
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="mt-3 w-full rounded-full bg-zinc-900 py-3.5 text-sm font-semibold text-white"
        >
          Modifier mon profil
        </button>
      )}

      <div className="mt-4 space-y-2">
        <Link
          href="/dashboard/houses"
          className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-sm"
        >
          <Icon name="building" className="h-5 w-5 text-zinc-700" />
          <span className="flex-1 text-sm font-semibold text-zinc-900">
            Mes annonces
          </span>
          <span className="text-zinc-400">→</span>
        </Link>
        <Link
          href={isAgent ? "/app/gains" : "/app/inbox"}
          className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-sm"
        >
          <Icon
            name={isAgent ? "wallet" : "inbox"}
            className="h-5 w-5 text-zinc-700"
          />
          <span className="flex-1 text-sm font-semibold text-zinc-900">
            {isAgent ? "Mes gains / Retirer" : "Réclamation"}
          </span>
          <span className="text-zinc-400">→</span>
        </Link>
        <Link
          href="/dashboard/houses/new"
          className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-sm"
        >
          <Icon name="publish" className="h-5 w-5 text-zinc-700" />
          <span className="flex-1 text-sm font-semibold text-zinc-900">
            Publier une maison
          </span>
          <span className="text-zinc-400">→</span>
        </Link>
      </div>

      <p className="mt-6 text-center text-[11px] text-zinc-400">
        Infos locales (téléphone, ville) — compte réel via Connexion ci-dessus.
      </p>
    </>
  );
}
