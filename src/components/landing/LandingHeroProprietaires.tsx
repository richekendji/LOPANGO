"use client";

/**
 * VERSION PROPRIÉTAIRES — campagne marketing
 * (démolition / forces de l'ordre / 125+ propriétaires).
 *
 * Pour réactiver : dans LandingPage.tsx, remplacer
 * <LandingHero /> par <LandingHeroProprietaires />.
 */

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { MagneticLink } from "./MagneticLink";

export function LandingHeroProprietaires() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-anim", {
        y: 32,
        opacity: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: "power3.out",
        delay: 0.1,
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative isolate flex min-h-[100dvh] items-end overflow-hidden"
    >
      <Image
        src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=70"
        alt="Maison contemporaine à louer — ambiance LOPANGO"
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover object-[center_45%]"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/35 to-black/15" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 pb-28 pt-28 sm:px-6 sm:pb-36">
        <div className="hero-anim max-w-lg">
          <p className="text-xl font-bold leading-snug tracking-tight text-white drop-shadow-sm sm:text-2xl">
            Les forces de l&apos;ordre vont démolir ta maison si elle figure
            dans les réseaux sociaux d&apos;un démarcheur.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/90 sm:text-[15px]">
            Un démarcheur a déjà filmé ta maison ? Tu peux encore te rattraper :
            appuie sur{" "}
            <span className="font-semibold text-white">
              Je suis propriétaire
            </span>
            , inscris-toi, puis publie avec{" "}
            <span className="font-semibold text-white">Publier ma maison</span>{" "}
            une fois inscrit. Comme les{" "}
            <span className="font-bold text-white">125+ propriétaires</span>{" "}
            déjà inscrits, qui ont publié leurs maisons eux-mêmes — ils ne sont
            pas complices des démarcheurs. Passe à l&apos;action !
          </p>
        </div>

        <div className="max-w-lg rounded-2xl bg-white/95 p-5 shadow-xl backdrop-blur-sm sm:p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#e11d48]">
            Avec LOPANGO
          </p>

          <p className="mt-2 text-xl font-bold leading-snug tracking-tight text-zinc-900 sm:text-2xl">
            Ta maison enregistrée à ton nom.
            <span className="text-zinc-500">
              {" "}
              Plus personne ne la revend dans ton dos.
            </span>
          </p>

          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            Tes photos, ton prix, ton numéro : l&apos;annonce officielle vient
            de toi — pas d&apos;un démarcheur. Les locataires t&apos;appellent
            directement.
          </p>

          <p className="mt-3 text-sm font-bold text-zinc-900">
            Chaque jour sans annonce officielle est un jour de risque.
            Inscris-toi maintenant — ça prend 2 minutes.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <div className="hero-cta-bounce sm:flex-1">
              <MagneticLink
                href="/register"
                variant="primary"
                className="w-full px-5 py-4 text-center text-[15px] font-bold shadow-lg shadow-zinc-900/25 !transition-none"
              >
                Je suis propriétaire
              </MagneticLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
