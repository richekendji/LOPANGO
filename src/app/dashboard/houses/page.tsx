"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SellerShell } from "@/components/seller/SellerShell";
import { isLocalImageUrl } from "@/lib/images";
import {
  STATUS_LABEL,
  formatFcfa,
  type HouseStatus,
  type SellerHouse,
} from "@/lib/mock/houses";
import { getHouses, subscribeStore } from "@/lib/mock/store";

type Filter = "all" | HouseStatus;

export default function HousesListPage() {
  const [houses, setHouses] = useState<SellerHouse[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    const refresh = () => setHouses(getHouses());
    refresh();
    return subscribeStore(refresh);
  }, []);

  const filtered = useMemo(() => {
    return houses.filter((h) => {
      if (filter !== "all" && h.status !== filter) return false;
      const hay = `${h.title} ${h.city} ${h.neighborhood}`.toLowerCase();
      return hay.includes(q.trim().toLowerCase());
    });
  }, [houses, filter, q]);

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "Tous" },
    { id: "draft", label: "Brouillon" },
    { id: "active", label: "En ligne" },
    { id: "hidden", label: "Masquée" },
  ];

  return (
    <SellerShell title="Mes annonces" backHref="/dashboard">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">
          {filtered.length} annonce{filtered.length !== 1 ? "s" : ""}
        </p>
        <Link
          href="/dashboard/houses/new"
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
        >
          + Publier
        </Link>
      </div>

      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Rechercher par titre ou ville…"
        className="mb-3 w-full rounded-2xl border border-[#ebebeb] bg-white px-4 py-3 text-sm outline-none focus:border-zinc-400"
      />

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
              filter === f.id
                ? "bg-zinc-900 text-white"
                : "bg-white text-zinc-600 shadow-sm"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[1.5rem] bg-white p-10 text-center text-sm text-zinc-500 shadow-sm">
          Aucune annonce pour ce filtre.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((h) => {
            const status = STATUS_LABEL[h.status];
            return (
              <Link
                key={h.id}
                href={`/dashboard/houses/${h.id}`}
                className="flex gap-3 rounded-[1.5rem] bg-white p-3 shadow-sm active:opacity-95"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-zinc-100">
                  {h.photos[0] ? (
                    <Image
                      src={h.photos[0]}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                      unoptimized={isLocalImageUrl(h.photos[0])}
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate font-semibold text-zinc-900">
                      {h.title}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <p className="truncate text-xs text-zinc-500">
                    {h.neighborhood ? `${h.neighborhood}, ` : ""}
                    {h.city}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="font-bold tabular-nums text-zinc-900">
                      {formatFcfa(h.price)}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {h.contacts} contacts · {h.updatedAt}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </SellerShell>
  );
}
