"use client";

import Image from "next/image";
import { useState } from "react";
import { isLocalImageUrl } from "@/lib/images";

/**
 * Galerie photo : image principale + flèches pour parcourir
 * toutes les photos d'une annonce.
 */
export function PhotoCarousel({
  photos,
  alt,
  className = "aspect-[9/16]",
  rounded = "rounded-[1.75rem]",
}: {
  photos: string[];
  alt: string;
  className?: string;
  rounded?: string;
}) {
  const [index, setIndex] = useState(0);
  const list = photos.length > 0 ? photos : [];
  const current = list[index] ?? null;
  const multi = list.length > 1;

  function prev() {
    setIndex((i) => (i - 1 + list.length) % list.length);
  }

  function next() {
    setIndex((i) => (i + 1) % list.length);
  }

  if (!current) {
    return (
      <div
        className={`relative flex w-full items-center justify-center bg-zinc-200 text-zinc-400 ${className} ${rounded}`}
      >
        Pas de photo
      </div>
    );
  }

  return (
    <div className={`relative w-full overflow-hidden bg-zinc-200 ${className} ${rounded}`}>
      <Image
        key={current.slice(0, 48)}
        src={current}
        alt={`${alt} — photo ${index + 1}`}
        fill
        sizes="(max-width: 512px) 100vw, 512px"
        className="object-cover"
        priority={index === 0}
        unoptimized={isLocalImageUrl(current)}
      />

      {multi && (
        <>
          <button
            type="button"
            aria-label="Photo précédente"
            onClick={prev}
            className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg font-bold text-zinc-900 shadow-md backdrop-blur hover:bg-white"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Photo suivante"
            onClick={next}
            className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg font-bold text-zinc-900 shadow-md backdrop-blur hover:bg-white"
          >
            ›
          </button>

          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {list.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Aller à la photo ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-5 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>

          <span className="absolute right-3 top-3 z-10 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
            {index + 1} / {list.length}
          </span>
        </>
      )}
    </div>
  );
}
