"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { isLocalImageUrl } from "@/lib/images";
import {
  HOUSE_TYPES,
  formatFcfa,
  type HouseType,
  type SellerHouse,
} from "@/lib/mock/houses";
import { getHouses, subscribeStore } from "@/lib/mock/store";
import { houseMatchesQuery } from "@/lib/search";

const SEARCH_DRAFT_KEY = "lopango_search_draft_v1";

type SearchDraft = {
  query: string;
  neighborhood: string;
  houseType: HouseType | "";
  minPrice: string;
  maxPrice: string;
};

export default function SearchPage() {
  const [houses, setHouses] = useState<SellerHouse[]>([]);
  const [query, setQuery] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [houseType, setHouseType] = useState<HouseType | "">("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SEARCH_DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw) as SearchDraft;
        setQuery(d.query ?? "");
        setNeighborhood(d.neighborhood ?? "");
        setHouseType(d.houseType ?? "");
        setMinPrice(d.minPrice ?? "");
        setMaxPrice(d.maxPrice ?? "");
      }
    } catch {
      /* ignore */
    }
    setReady(true);
    const refresh = () => setHouses(getHouses());
    refresh();
    return subscribeStore(refresh);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const draft: SearchDraft = {
      query,
      neighborhood,
      houseType,
      minPrice,
      maxPrice,
    };
    localStorage.setItem(SEARCH_DRAFT_KEY, JSON.stringify(draft));
  }, [query, neighborhood, houseType, minPrice, maxPrice, ready]);

  const neighborhoods = useMemo(() => {
    const set = new Set(
      houses
        .filter((h) => h.status === "active")
        .map((h) => h.neighborhood)
        .filter(Boolean),
    );
    return Array.from(set).sort();
  }, [houses]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const min = minPrice ? Math.round(Number(minPrice)) : null;
    const max = maxPrice ? Math.round(Number(maxPrice)) : null;

    return houses.filter((h) => {
      if (h.status !== "active") return false;

      if (neighborhood && h.neighborhood !== neighborhood) return false;
      if (houseType && (h.houseType ?? "Maison") !== houseType) return false;
      if (min !== null && !Number.isNaN(min) && h.price < min) return false;
      if (max !== null && !Number.isNaN(max) && h.price > max) return false;

      if (!q) return true;

      return houseMatchesQuery(h, q);
    });
  }, [houses, query, neighborhood, houseType, minPrice, maxPrice]);

  const field =
    "w-full rounded-2xl border border-[#ebebeb] bg-white px-4 py-3 text-sm outline-none focus:border-zinc-400";

  return (
    <div className="px-4 pb-4">
      <h1 className="text-lg font-bold text-zinc-900">Recherche</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Filtrez par mots-clés, quartier, prix ou type de maison.
      </p>

      {/* Barre de recherche principale */}
      <div className="relative mt-4">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
          <Icon name="search" className="h-4 w-4" />
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex : 4 chambres salon Bacongo…"
          className={`${field} pl-11`}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="block space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
            Quartier
          </span>
          <select
            className={field}
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
          >
            <option value="">Tous</option>
            {neighborhoods.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
            Type
          </span>
          <select
            className={field}
            value={houseType}
            onChange={(e) =>
              setHouseType(e.target.value as HouseType | "")
            }
          >
            <option value="">Tous</option>
            {HOUSE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
            Prix min (FCFA)
          </span>
          <input
            type="number"
            min={0}
            step={10000}
            className={field}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Ex : 100000"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
            Prix max (FCFA)
          </span>
          <input
            type="number"
            min={0}
            step={10000}
            className={field}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Ex : 500000"
          />
        </label>
      </div>

      {(query || neighborhood || houseType || minPrice || maxPrice) && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setNeighborhood("");
            setHouseType("");
            setMinPrice("");
            setMaxPrice("");
          }}
          className="mt-3 text-xs font-semibold text-zinc-500 underline"
        >
          Réinitialiser les filtres
        </button>
      )}

      <p className="mt-5 text-xs font-medium text-zinc-400">
        {results.length} résultat{results.length !== 1 ? "s" : ""}
      </p>

      <div className="mt-3 space-y-4">
        {results.length === 0 ? (
          <div className="rounded-[1.5rem] bg-white p-8 text-center text-sm text-zinc-500 shadow-sm">
            Aucune maison ne correspond à votre recherche.
          </div>
        ) : (
          results.map((h) => (
            <Link
              key={h.id}
              href={`/houses/${h.id}`}
              className="flex gap-3 rounded-[1.5rem] bg-white p-3 shadow-sm active:opacity-95"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-zinc-100">
                {h.photos[0] && (
                  <Image
                    src={h.photos[0]}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                    unoptimized={isLocalImageUrl(h.photos[0])}
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-zinc-900">{h.title}</p>
                <p className="truncate text-xs text-zinc-500">
                  {h.houseType ?? "Maison"} ·{" "}
                  {[h.neighborhood, h.city].filter(Boolean).join(", ")}
                </p>
                {h.features.length > 0 && (
                  <p className="mt-1 truncate text-[11px] text-zinc-500">
                    {h.features
                      .slice(0, 3)
                      .map((f) => `${f.label} ${f.value}`)
                      .join(" · ")}
                  </p>
                )}
                <p className="mt-2 text-sm font-bold tabular-nums text-zinc-900">
                  {formatFcfa(h.price)}
                  <span className="font-normal text-zinc-400"> /mois</span>
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
