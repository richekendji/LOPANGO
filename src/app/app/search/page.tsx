"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { isLocalImageUrl } from "@/lib/images";
import {
  HOUSE_TYPES,
  formatFcfa,
  formatHouseSpecsShort,
  type HouseType,
} from "@/lib/mock/houses";
import { getHouses, subscribeStore } from "@/lib/mock/store";
import { houseMatchesQuery } from "@/lib/search";

const SEARCH_DRAFT_KEY = "lopango_search_draft_v1";

type SearchDraft = {
  query: string;
  committedQuery: string;
  neighborhood: string;
  houseType: HouseType | "";
  minPrice: string;
  maxPrice: string;
};

export default function SearchPage() {
  const [houses, setHouses] = useState<ReturnType<typeof getHouses>>([]);
  const [query, setQuery] = useState("");
  const [committedQuery, setCommittedQuery] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [houseType, setHouseType] = useState<HouseType | "">("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [ready, setReady] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SEARCH_DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw) as SearchDraft;
        setQuery(d.query ?? "");
        setCommittedQuery(d.committedQuery ?? d.query ?? "");
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
      committedQuery,
      neighborhood,
      houseType,
      minPrice,
      maxPrice,
    };
    localStorage.setItem(SEARCH_DRAFT_KEY, JSON.stringify(draft));
  }, [
    query,
    committedQuery,
    neighborhood,
    houseType,
    minPrice,
    maxPrice,
    ready,
  ]);

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
    const q = committedQuery.trim();
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
  }, [houses, committedQuery, neighborhood, houseType, minPrice, maxPrice]);

  function runSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const next = query.trim();
    setCommittedQuery(next);
    // Laisser React appliquer le filtre puis scroller
    window.setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }

  function resetAll() {
    setQuery("");
    setCommittedQuery("");
    setNeighborhood("");
    setHouseType("");
    setMinPrice("");
    setMaxPrice("");
  }

  const hasCriteria =
    Boolean(committedQuery) ||
    Boolean(neighborhood) ||
    Boolean(houseType) ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    Boolean(query.trim());

  /** Clic dans le vide (hors champs / boutons / cartes) → reset filtres. */
  function handleEmptyClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!hasCriteria) return;
    const el = e.target as HTMLElement;
    if (
      el.closest(
        "a, button, input, select, textarea, label, form, [data-search-hit]",
      )
    ) {
      return;
    }
    resetAll();
  }

  const field =
    "w-full rounded-2xl border border-[#ebebeb] bg-white px-4 py-3 text-sm outline-none focus:border-zinc-400";

  return (
    <div className="min-h-[70vh] px-4 pb-4" onClick={handleEmptyClick}>
      <h1 className="text-lg font-bold text-zinc-900">Recherche</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Tape un mot-clé puis Entrée — ou utilise les filtres.
      </p>

      <form onSubmit={runSearch} className="mt-4">
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
              <Icon name="search" className="h-4 w-4" />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              enterKeyHint="search"
              placeholder="Ex : 3 chambres, salon, Bacongo…"
              className={`${field} pl-11`}
              aria-label="Mots-clés"
            />
          </div>
          <button
            type="submit"
            className="shrink-0 rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Chercher
          </button>
        </div>
      </form>

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

      {hasCriteria && (
        <button
          type="button"
          onClick={resetAll}
          className="mt-3 text-xs font-semibold text-zinc-500 underline"
        >
          Réinitialiser les filtres
        </button>
      )}

      <div ref={resultsRef} className="mt-5 scroll-mt-4">
        <p className="text-xs font-medium text-zinc-400">
          {committedQuery ? (
            <>
              Résultats pour « {committedQuery} » — {results.length} maison
              {results.length !== 1 ? "s" : ""}
            </>
          ) : (
            <>
              {results.length} résultat{results.length !== 1 ? "s" : ""}
              {!hasCriteria && " — tape un mot-clé puis Entrée"}
            </>
          )}
        </p>

        <div className="mt-3 space-y-4">
          {results.length === 0 ? (
            <div className="rounded-[1.5rem] bg-white p-8 text-center text-sm text-zinc-500 shadow-sm">
              {committedQuery || hasCriteria
                ? "Aucune maison ne correspond à votre recherche."
                : "Lance une recherche pour voir les maisons."}
            </div>
          ) : (
            results.map((h) => (
              <Link
                key={h.id}
                href={`/houses/${h.id}`}
                data-search-hit
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
                  <p className="truncate font-semibold text-zinc-900">
                    {h.title}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    {h.houseType ?? "Maison"} ·{" "}
                    {[h.neighborhood, h.city].filter(Boolean).join(", ")}
                  </p>
                  <p className="mt-1 truncate text-[11px] text-zinc-500">
                    {formatHouseSpecsShort(h)}
                  </p>
                  <p className="mt-2 text-sm font-bold tabular-nums text-zinc-900">
                    {formatFcfa(h.price)}
                    <span className="font-normal text-zinc-400"> /mois</span>
                    <span className="ml-1 text-[11px] font-semibold text-emerald-700">
                      · Négociable
                    </span>
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
