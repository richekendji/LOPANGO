"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    n: "01",
    title: "Créer ton compte",
    body: "Prénom, numéro 06/05, mot de passe — tu entres directement dans l’app.",
    Visual: VisualHelix,
  },
  {
    n: "02",
    title: "Débloquer l’accès",
    body: "Abonnement Mobile Money — 4 999 FCFA/mois ou 49 990 FCFA/an — pour publier ou voir les contacts.",
    Visual: VisualScan,
  },
  {
    n: "03",
    title: "Publier ou contacter",
    body: "Les propriétaires publient. Les locataires débloquent les infos et écrivent en direct.",
    Visual: VisualWave,
  },
];

function VisualHelix() {
  return (
    <svg viewBox="0 0 200 120" className="h-28 w-full text-white/40" aria-hidden>
      <g className="origin-center animate-[spin_18s_linear_infinite]">
        <ellipse cx="100" cy="60" rx="70" ry="28" fill="none" stroke="currentColor" strokeWidth="1" />
        <ellipse cx="100" cy="60" rx="50" ry="18" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="100" cy="60" r="4" fill="#e11d48" />
      </g>
    </svg>
  );
}

function VisualScan() {
  return (
    <svg viewBox="0 0 200 120" className="h-28 w-full" aria-hidden>
      {Array.from({ length: 5 }).map((_, row) =>
        Array.from({ length: 10 }).map((_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={20 + col * 18}
            cy={24 + row * 18}
            r="2"
            fill="rgba(255,255,255,0.35)"
          />
        )),
      )}
      <rect
        x="0"
        y="0"
        width="200"
        height="3"
        fill="#e11d48"
      className="animate-[scan_2.8s_ease-in-out_infinite]"
      style={{ animation: "scan 2.8s ease-in-out infinite" }}
    />
    </svg>
  );
}

function VisualWave() {
  return (
    <svg viewBox="0 0 200 120" className="h-28 w-full" aria-hidden>
      <path
        d="M10 60 Q 40 20, 70 60 T 130 60 T 190 60"
        fill="none"
        stroke="#e11d48"
        strokeWidth="2"
        strokeDasharray="180"
        className="animate-[dash_2.4s_linear_infinite]"
        style={{ animation: "dash 2.4s linear infinite" }}
      />
      <path
        d="M10 70 Q 40 100, 70 70 T 130 70 T 190 70"
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function LandingProtocol() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add("(min-width: 768px)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(".proto-card");
        cards.forEach((card, i) => {
          if (i === cards.length - 1) return;
          ScrollTrigger.create({
            trigger: card,
            start: "top top+=72",
            endTrigger: cards[cards.length - 1],
            end: "top top+=72",
            pin: true,
            pinSpacing: false,
            onUpdate: (self) => {
              const next = cards[i + 1];
              if (!next) return;
              const p = self.progress;
              // When next card approaches, shrink current
              gsap.set(card, {
                scale: 1 - p * 0.08,
                filter: `blur(${p * 8}px)`,
                opacity: 1 - p * 0.35,
              });
            },
          });
        });
      });
    }, rootRef);

    return () => {
      ctx.revert();
      mm.revert();
    };
  }, []);

  return (
    <section
      id="protocole"
      ref={rootRef}
      className="bg-[#f5f5f5] px-4 py-20 sm:px-6"
    >
      <div className="mx-auto max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
          Protocole
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
          Trois étapes. Zéro intermédiaire.
        </h2>

        <div className="mt-10 space-y-6">
          {STEPS.map((step) => (
            <article
              key={step.n}
              className="proto-card rounded-2xl border border-white/10 bg-zinc-900 p-6 text-white shadow-xl sm:p-8"
            >
              <p className="font-mono text-xs tracking-widest text-zinc-400">
                {step.n}
              </p>
              <h3 className="mt-3 text-2xl font-bold">{step.title}</h3>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-zinc-300">
                {step.body}
              </p>
              <div className="mt-6 rounded-2xl bg-black/30 p-3">
                <step.Visual />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
