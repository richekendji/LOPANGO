"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SellerShell } from "@/components/seller/SellerShell";
import { HouseForm } from "@/components/seller/HouseForm";
import type { SellerHouse } from "@/lib/mock/houses";

export default function EditHousePage() {
  const { id } = useParams<{ id: string }>();
  const [house, setHouse] = useState<SellerHouse | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/houses/mine", { cache: "no-store" });
        const data = (await res.json()) as {
          ok?: boolean;
          houses?: SellerHouse[];
        };
        const found = (data.houses ?? []).find((h) => h.id === id) ?? null;
        if (!cancelled) setHouse(found);
      } catch {
        if (!cancelled) setHouse(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (house === undefined) {
    return (
      <SellerShell title="Modifier" backHref={`/dashboard/houses/${id}`}>
        <p className="text-center text-sm text-zinc-500">Chargement…</p>
      </SellerShell>
    );
  }

  if (!house) {
    return (
      <SellerShell title="Modifier" backHref="/dashboard/houses">
        <p className="text-center text-sm text-zinc-500">Annonce introuvable.</p>
      </SellerShell>
    );
  }

  return (
    <SellerShell title="Modifier l'annonce" backHref={`/dashboard/houses/${id}`}>
      <HouseForm initial={house} houseId={house.id} />
    </SellerShell>
  );
}