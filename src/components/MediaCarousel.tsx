"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { isLocalImageUrl } from "@/lib/images";
import { isIdbVideoRef, isVideoRef, resolveVideoUrl } from "@/lib/video";

type MediaItem =
  | { kind: "image"; src: string }
  | { kind: "video"; src: string };

/**
 * Galerie photo + vidéo (flèches, compteur).
 */
export function MediaCarousel({
  photos,
  videos = [],
  alt,
  className = "aspect-[9/16]",
  rounded = "rounded-[1.75rem]",
}: {
  photos: string[];
  videos?: string[];
  alt: string;
  className?: string;
  rounded?: string;
}) {
  const items = useMemo<MediaItem[]>(() => {
    const list: MediaItem[] = [
      ...photos.map((src) => ({ kind: "image" as const, src })),
      ...videos.map((src) => ({ kind: "video" as const, src })),
    ];
    return list;
  }, [photos, videos]);

  const [index, setIndex] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const current = items[index] ?? null;
  const multi = items.length > 1;

  useEffect(() => {
    let revoked: string | null = null;
    let cancelled = false;

    async function load() {
      setVideoUrl(null);
      if (!current || current.kind !== "video") return;
      const url = await resolveVideoUrl(current.src);
      if (cancelled) {
        if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
        return;
      }
      setVideoUrl(url);
      if (url?.startsWith("blob:") && isIdbVideoRef(current.src)) {
        revoked = url;
      }
    }

    void load();
    return () => {
      cancelled = true;
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [current]);

  function prev() {
    setIndex((i) => (i - 1 + items.length) % items.length);
  }

  function next() {
    setIndex((i) => (i + 1) % items.length);
  }

  if (!current) {
    return (
      <div
        className={`relative flex w-full items-center justify-center bg-zinc-200 text-zinc-400 ${className} ${rounded}`}
      >
        Pas de média
      </div>
    );
  }

  return (
    <div
      className={`relative w-full overflow-hidden bg-zinc-200 ${className} ${rounded}`}
    >
      {current.kind === "image" ? (
        <Image
          key={current.src.slice(0, 48)}
          src={current.src}
          alt={`${alt} — photo ${index + 1}`}
          fill
          sizes="(max-width: 512px) 100vw, 512px"
          className="object-cover"
          priority={index === 0}
          unoptimized={isLocalImageUrl(current.src)}
        />
      ) : videoUrl ? (
        <video
          key={videoUrl}
          src={videoUrl}
          className="absolute inset-0 h-full w-full object-cover"
          controls
          playsInline
          preload="metadata"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-500">
          Chargement vidéo…
        </div>
      )}

      {current.kind === "video" && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
          Vidéo
        </span>
      )}

      {multi && (
        <>
          <button
            type="button"
            aria-label="Média précédent"
            onClick={prev}
            className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg font-bold text-zinc-900 shadow-md backdrop-blur hover:bg-white"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Média suivant"
            onClick={next}
            className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg font-bold text-zinc-900 shadow-md backdrop-blur hover:bg-white"
          >
            ›
          </button>

          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {items.map((item, i) => (
              <button
                key={`${item.kind}-${i}`}
                type="button"
                aria-label={`Aller au média ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-5 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>

          <span className="absolute right-3 top-3 z-10 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
            {index + 1} / {items.length}
          </span>
        </>
      )}
    </div>
  );
}

export function isPlayableVideo(src: string) {
  return isVideoRef(src);
}
