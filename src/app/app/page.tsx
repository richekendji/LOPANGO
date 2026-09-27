"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FeedPostCard } from "@/components/feed/FeedPostCard";
import type { SellerHouse } from "@/lib/mock/houses";
import { getProfile, subscribeStore } from "@/lib/mock/store";

export default function AppHomePage() {
  const [houses, setHouses] = useState<SellerHouse[] | null>(null);
  const [username, setUsername] = useState("jean.dupont4821");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/houses", { cache: "no-store" });
        const data = (await res.json()) as {
          ok?: boolean;
          houses?: SellerHouse[];
        };
        if (!cancelled) setHouses(data.houses ?? []);
      } catch {
        if (!cancelled) setHouses([]);
      }
    })();
    setUsername(getProfile().username);
    return () => {
      cancelled = true;
    };
  }, []);

  // Le username peut changer (profil édité localement).
  useEffect(() => {
    return subscribeStore(() => setUsername(getProfile().username));
  }, []);

  if (houses === null) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-zinc-500">
        Chargement des maisons…
      </div>
    );
  }

  if (houses.length === 0) {
    return (
      <div className="px-4">
        <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold text-zinc-900">
            Aucune maison publiée pour le moment
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Sois le premier : publie ta maison en quelques minutes.
          </p>
          <Link
            href="/dashboard/houses/new"
            className="mt-4 inline-flex rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Publier une maison
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4">
      <div className="mt-4 space-y-5 pb-2">
        {houses.map((house) => (
          <FeedPostCard key={house.id} house={house} username={username} />
        ))}
      </div>
    </div>
  );
}