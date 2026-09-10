"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { isLocalImageUrl } from "@/lib/images";
import { type SellerHouse } from "@/lib/mock/houses";

export function FeedPostCard({
  house,
  username,
}: {
  house: SellerHouse;
  username: string;
}) {
  const photos = house.photos.length > 0 ? house.photos : [];
  const [index, setIndex] = useState(0);
  const current = photos[index] ?? null;
  const multi = photos.length > 1;
  const handle = username.replace(/^@/, "") || "lopango";

  function prev(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!multi) return;
    setIndex((i) => (i - 1 + photos.length) % photos.length);
  }

  function next(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!multi) return;
    setIndex((i) => (i + 1) % photos.length);
  }

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[11px] font-bold uppercase text-zinc-600 ring-1 ring-zinc-300">
          {house.showOwnerName === false
            ? "?"
            : handle.slice(0, 2)}
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

      {/* Photo carrée + flèches */}
      <div className="relative aspect-square w-full bg-zinc-100">
        {current ? (
          <Image
            key={current}
            src={current}
            alt=""
            fill
            sizes="(max-width: 512px) 100vw, 512px"
            className="object-cover"
            unoptimized={isLocalImageUrl(current)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-400">
            Pas de photo
          </div>
        )}

        {multi && (
          <>
            <button
              type="button"
              aria-label="Photo précédente"
              onClick={prev}
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl font-bold text-zinc-900 shadow-md backdrop-blur hover:bg-white"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Photo suivante"
              onClick={next}
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl font-bold text-zinc-900 shadow-md backdrop-blur hover:bg-white"
            >
              ›
            </button>
            <span className="absolute right-3 top-3 z-10 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
              {index + 1} / {photos.length}
            </span>
          </>
        )}
      </div>

      {/* Dots sous la photo */}
      {multi && (
        <div className="flex justify-center gap-1.5 py-2.5">
          {photos.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Photo ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                i === index ? "bg-sky-500" : "bg-zinc-300"
              }`}
            />
          ))}
        </div>
      )}

      <div className={`px-3 pb-3.5 ${multi ? "pt-0.5" : "pt-3"}`}>
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
