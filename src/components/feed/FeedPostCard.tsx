"use client";

import Link from "next/link";
import { Icon } from "@/components/Icon";
import { MediaCarousel } from "@/components/MediaCarousel";
import { type SellerHouse } from "@/lib/mock/houses";

export function FeedPostCard({
  house,
  username,
}: {
  house: SellerHouse;
  username: string;
}) {
  const handle = username.replace(/^@/, "") || "lopango";
  const hasMedia =
    house.photos.length > 0 || (house.videos?.length ?? 0) > 0;

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[11px] font-bold uppercase text-zinc-600 ring-1 ring-zinc-300">
          {house.showOwnerName === false ? "?" : handle.slice(0, 2)}
        </span>
        <p className="min-w-0 flex-1 truncate text-[13px] font-semibold text-zinc-900">
          {house.showOwnerName === false ? "Anonyme" : handle}
        </p>
        <button
          type="button"
          aria-label="Options"
          className="flex h-8 w-8 items-center justify-center text-zinc-400"
        >
          <Icon name="more" className="h-5 w-5" />
        </button>
      </div>

      {/* Média carré (photos + vidéos) */}
      {hasMedia ? (
        <MediaCarousel
          photos={house.photos}
          videos={house.videos ?? []}
          alt={house.title}
          className="aspect-[9/16]"
          rounded="rounded-none"
        />
      ) : (
        <div className="flex aspect-[9/16] w-full items-center justify-center bg-zinc-100 text-sm text-zinc-400">
          Pas de média
        </div>
      )}

      <div className="px-3 pb-3.5 pt-3">
        <Link
          href={`/houses/${house.id}`}
          className="flex w-full items-center justify-center rounded-full bg-zinc-900 py-2.5 text-sm font-semibold text-white active:opacity-90"
        >
          Voir les informations
        </Link>
      </div>
    </article>
  );
}
