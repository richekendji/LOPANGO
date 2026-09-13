"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { AdminUserRow } from "@/lib/admin";
import {
  formatAdminDate,
  formatAdminPhone,
  roleHint,
  roleLabel,
} from "@/lib/admin-format";

type Filter = "all" | "tenant" | "owner";

export function AdminUsersBoard({ users }: { users: AdminUserRow[] }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return users.filter((u) => {
      if (filter === "tenant" && u.role !== "tenant") return false;
      if (filter === "owner" && u.role !== "owner") return false;
      if (!query) return true;
      const hay =
        `${u.fullName} ${u.firstName} ${u.lastName} ${u.phone ?? ""}`.toLowerCase();
      return hay.includes(query);
    });
  }, [users, q, filter]);

  const tabs: { id: Filter; label: string }[] = [
    { id: "all", label: "Tous" },
    { id: "tenant", label: "Locataires" },
    { id: "owner", label: "Propriétaires" },
  ];

  return (
    <div className="space-y-3">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Nom, prénom, numéro…"
        className="w-full rounded-2xl border border-[#ebebeb] bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400"
      />

      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setFilter(t.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              filter === t.id
                ? "bg-zinc-900 text-white"
                : "bg-white text-zinc-600 shadow-sm"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
        {list.length} personne{list.length > 1 ? "s" : ""}
      </p>

      <div className="space-y-2">
        {list.map((u) => {
          const initials =
            `${u.firstName.charAt(0)}${u.lastName.charAt(0) || u.firstName.charAt(1) || ""}`.toUpperCase();
          return (
            <Link
              key={u.id}
              href={`/admin/${u.id}`}
              className="flex items-center gap-3 rounded-2xl bg-white px-3 py-3 shadow-sm"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white">
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-zinc-900">
                  {u.fullName}
                </p>
                <p className="truncate font-mono text-[12px] text-zinc-500">
                  {formatAdminPhone(u.phone)}
                </p>
                <p className="mt-0.5 text-[11px] text-zinc-400">
                  {roleHint(u.role)} · {formatAdminDate(u.createdAt)}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  u.role === "owner"
                    ? "bg-zinc-900 text-white"
                    : "bg-[#f5f5f5] text-zinc-600"
                }`}
              >
                {roleLabel(u.role)}
              </span>
            </Link>
          );
        })}
        {list.length === 0 && (
          <div className="rounded-2xl bg-white px-4 py-8 text-center text-sm text-zinc-500 shadow-sm">
            Personne ici.
          </div>
        )}
      </div>
    </div>
  );
}
