"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HouseSpecsGrid } from "@/components/HouseSpecsGrid";
import { MediaCarousel } from "@/components/MediaCarousel";
import { SellerShell } from "@/components/seller/SellerShell";
import {
  STATUS_LABEL,
  formatFcfa,
  getLockedAddressRows,
  type HouseStatus,
  type SellerHouse,
} from "@/lib/mock/houses";
import {
  deleteHouse,
  getHouse,
  setHouseStatus,
  subscribeStore,
} from "@/lib/mock/store";

const CYCLE: HouseStatus[] = ["draft", "active", "hidden"];

export default function HouseDetailSellerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [house, setHouse] = useState<SellerHouse | null>(null);

  useEffect(() => {
    const refresh = () => setHouse(getHouse(id) ?? null);
    refresh();
    return subscribeStore(refresh);
  }, [id]);

  if (!house) {
    return (
      <SellerShell title="Annonce" backHref="/dashboard/houses">
        <div className="rounded-[1.5rem] bg-white p-8 text-center text-sm text-zinc-500 shadow-sm">
          Annonce introuvable.
        </div>
      </SellerShell>
    );
  }

  const status = STATUS_LABEL[house.status];

  function cycleStatus() {
    const i = CYCLE.indexOf(house!.status);
    const next = CYCLE[(i + 1) % CYCLE.length];
    setHouseStatus(house!.id, next);
  }

  function onDelete() {
    if (!confirm("Supprimer définitivement cette annonce ?")) return;
    deleteHouse(house!.id);
    router.push("/dashboard/houses");
  }

  return (
    <SellerShell title="Détail annonce" backHref="/dashboard/houses">
      <div className="space-y-4">
        <MediaCarousel
          photos={house.photos}
          videos={house.videos ?? []}
          alt={house.title}
          className="mx-auto aspect-[9/16] w-full max-w-sm"
        />

        <div className="rounded-2xl bg-white px-4 py-3.5 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h1 className="text-lg font-bold leading-snug text-zinc-900">
                {house.title}
              </h1>
              <p className="mt-0.5 text-xs text-zinc-500">
                {[house.neighborhood, house.city].filter(Boolean).join(", ")}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.className}`}
            >
              {status.label}
            </span>
          </div>
          <p className="mt-2.5 text-xl font-bold tabular-nums text-zinc-900">
            {formatFcfa(house.price)}
            <span className="text-xs font-normal text-zinc-500"> /mois</span>
            <span className="ml-1.5 text-xs font-semibold text-emerald-700">
              · Négociable
            </span>
          </p>
          <p className="mt-2.5 whitespace-pre-wrap text-[13px] leading-relaxed text-zinc-600">
            {house.description || "Pas de description."}
          </p>
          <HouseSpecsGrid house={house} />
          <div className="mt-3 space-y-1.5 border-t border-[#ebebeb] pt-3">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-zinc-400">
              Adresse exacte
            </p>
            {getLockedAddressRows(house).map((row) => (
              <div
                key={row.label}
                className="flex justify-between gap-3 text-[13px]"
              >
                <span className="shrink-0 text-zinc-400">{row.label}</span>
                <span className="max-w-[65%] text-right font-semibold text-zinc-900">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1.5 border-t border-[#ebebeb] pt-3">
            {house.showOwnerName !== false && (
              <div className="flex justify-between gap-3 text-[13px]">
                <span className="text-zinc-400">Propriétaire</span>
                <span className="font-semibold text-zinc-900">
                  {house.ownerName || "Propriétaire"}
                </span>
              </div>
            )}
            <div className="flex justify-between gap-3 text-[13px]">
              <span className="text-zinc-400">Numéro du propriétaire</span>
              <span className="font-semibold text-zinc-900">{house.phone}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={cycleStatus}
            className="rounded-full border border-[#ebebeb] bg-white py-3.5 text-sm font-semibold text-zinc-900"
          >
            Changer le statut (→{" "}
            {
              STATUS_LABEL[
                CYCLE[(CYCLE.indexOf(house.status) + 1) % CYCLE.length]
              ].label
            }
            )
          </button>
          <Link
            href={`/dashboard/houses/${house.id}/edit`}
            className="rounded-full bg-zinc-900 py-3.5 text-center text-sm font-semibold text-white"
          >
            Modifier
          </Link>
          <Link
            href={`/houses/${house.id}`}
            className="rounded-full border border-[#ebebeb] bg-white py-3.5 text-center text-sm font-semibold text-zinc-900"
          >
            Voir comme locataire
          </Link>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-full py-3.5 text-sm font-semibold text-red-600"
          >
            Supprimer
          </button>
        </div>
      </div>
    </SellerShell>
  );
}
