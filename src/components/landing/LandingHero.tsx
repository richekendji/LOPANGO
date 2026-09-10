"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { MagneticLink } from "./MagneticLink";

export function LandingHero() {
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
        src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2400&q=80"
        alt="Maison contemporaine à louer — ambiance LOPANGO"
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover object-[center_45%]"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/35 to-black/15" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 pb-14 pt-28 sm:px-6 sm:pb-20">
        {/* Hors du bloc blanc — sur la photo */}
        <div className="hero-anim max-w-lg">
          <p className="text-xl font-bold leading-snug tracking-tight text-white drop-shadow-sm sm:text-2xl">
            La vie devient facile sans les démarcheurs.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/90 sm:text-[15px]">
            Cette semaine, plus de{" "}
            <span className="font-bold text-white">300 personnes</span> ont
            trouvé une maison entre Brazzaville et Pointe-Noire. Qu&apos;est-ce
            que tu attends ? Lance-toi et installe-toi dans ta nouvelle maison.
            Propriétaire ? Clique sur{" "}
            <span className="font-semibold text-white">
              Je suis propriétaire
            </span>{" "}
            pour mettre ta maison en ligne — et ne plus compter seulement sur
            les démarcheurs.
          </p>
        </div>

        {/* Bloc texte */}
        <div className="hero-anim max-w-lg rounded-2xl bg-white/95 p-5 shadow-xl backdrop-blur-sm sm:p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#e11d48]">
            Sans démarcheurs
          </p>

          <p className="mt-2 text-xl font-bold leading-snug tracking-tight text-zinc-900 sm:text-2xl">
            Plus de caution en surplus.
            <span className="text-zinc-500">
              {" "}
              Plus de 5&nbsp;000 FCFA pour une visite inutile.
            </span>
          </p>

          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            Avec <span className="font-semibold text-zinc-900">LOPANGO</span> :
            tu cherches, tu appelles le propriétaire, tu vas voir — sans frais.
            Votre déménagement est notre mission.
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
            <div className="hero-cta-bounce sm:flex-1">
              <MagneticLink
                href="/register"
                variant="secondary"
                className="w-full border-2 border-zinc-900 px-5 py-4 text-center text-[15px] font-bold shadow-md !transition-none"
              >
                Je cherche une maison
              </MagneticLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
