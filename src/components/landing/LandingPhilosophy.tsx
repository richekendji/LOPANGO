"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function LandingPhilosophy() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".philo-line", {
        y: 36,
        opacity: 0,
        duration: 0.85,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 70%",
        },
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative isolate overflow-hidden bg-zinc-900 px-4 py-24 sm:px-6"
    >
      <Image
        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80"
        alt=""
        fill
        sizes="100vw"
        className="pointer-events-none -z-10 object-cover opacity-20"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-zinc-900/40 to-zinc-900/90" />

      <div className="mx-auto max-w-4xl">
        <p className="philo-line text-base text-zinc-400 sm:text-lg">
          La plupart des locations au Congo passent par : démarcheurs, intermédiaires
          et frais cachés.
        </p>
        <p className="philo-line mt-8 text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl">
          Nous misons sur : le contact{" "}
          <span className="text-[#e11d48]">direct</span> propriétaire ↔ locataire.
        </p>
      </div>
    </section>
  );
}
