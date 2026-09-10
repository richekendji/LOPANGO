"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const MIXER_LABELS = ["Brazzaville", "Pointe-Noire", "Tout le Congo"];
const TYPE_LINES = [
  "Nouvelle demande — Bacongo, 3 chambres",
  "Propriétaire contacté — réponse en 12 min",
  "Visite confirmée — samedi 10h",
];
const DAYS = ["L", "M", "M", "J", "V", "S", "D"];

function MixerCard() {
  const [order, setOrder] = useState(MIXER_LABELS);

  useEffect(() => {
    const id = setInterval(() => {
      setOrder((prev) => {
        const next = [...prev];
        next.unshift(next.pop()!);
        return next;
      });
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-[#ebebeb] bg-white p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
        Couverture
      </p>
      <h3 className="mt-1 text-lg font-bold text-zinc-900">
        Maisons partout au Congo
      </h3>
      <p className="mt-1 text-sm text-zinc-500">
        Brazzaville, Pointe-Noire et au-delà — un seul feed.
      </p>
      <div className="relative mt-5 flex-1 overflow-hidden rounded-2xl bg-[#f5f5f5] p-3">
        <div className="flex h-full flex-col justify-end gap-2">
          {order.map((label, i) => (
            <div
              key={label}
              className="rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-zinc-900 shadow-sm transition-all duration-500"
              style={{
                transform: `translateY(${(2 - i) * -2}px) scale(${1 - i * 0.03})`,
                opacity: 1 - i * 0.15,
                transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                zIndex: 3 - i,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function TypewriterCard() {
  const [lineIdx, setLineIdx] = useState(0);
  const [text, setText] = useState("");

  useEffect(() => {
    const full = TYPE_LINES[lineIdx];
    let i = 0;
    setText("");
    const type = setInterval(() => {
      i += 1;
      setText(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(type);
        setTimeout(() => setLineIdx((n) => (n + 1) % TYPE_LINES.length), 1600);
      }
    }, 38);
    return () => clearInterval(type);
  }, [lineIdx]);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-[#ebebeb] bg-white p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
        Messages
      </p>
      <h3 className="mt-1 text-lg font-bold text-zinc-900">
        Contact direct propriétaire
      </h3>
      <p className="mt-1 text-sm text-zinc-500">
        Tu parles au propriétaire — vous vous arrangez entre vous.
      </p>
      <div className="mt-5 flex-1 rounded-2xl bg-zinc-900 p-4 font-mono text-[12px] leading-relaxed text-zinc-100">
        <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e11d48] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#e11d48]" />
          </span>
          Flux en direct
        </div>
        <p>
          {text}
          <span className="ml-0.5 inline-block h-3 w-[2px] animate-pulse bg-[#e11d48]" />
        </p>
      </div>
    </article>
  );
}

function SchedulerCard() {
  const [active, setActive] = useState(4);
  const [cursor, setCursor] = useState({ x: 12, y: 40, press: false });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    async function loop() {
      while (!cancelled) {
        setSaved(false);
        for (const day of [1, 3, 5, 4]) {
          if (cancelled) return;
          setCursor({ x: 14 + day * 36, y: 52, press: false });
          await sleep(500);
          setCursor((c) => ({ ...c, press: true }));
          setActive(day);
          await sleep(220);
          setCursor((c) => ({ ...c, press: false }));
          await sleep(350);
        }
        setCursor({ x: 118, y: 118, press: false });
        await sleep(400);
        setCursor((c) => ({ ...c, press: true }));
        setSaved(true);
        await sleep(250);
        setCursor((c) => ({ ...c, press: false }));
        await sleep(1800);
      }
    }
    void loop();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-[#ebebeb] bg-white p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
        Abonnement
      </p>
      <h3 className="mt-1 text-lg font-bold text-zinc-900">
        Un accès pour publier et débloquer
      </h3>
      <p className="mt-1 text-sm text-zinc-500">
        Photos, contacts et détails — un seul abonnement Mobile Money.
      </p>
      <div className="relative mt-5 flex-1 overflow-hidden rounded-2xl bg-[#f5f5f5] p-4">
        <div className="grid grid-cols-7 gap-1.5">
          {DAYS.map((d, i) => (
            <div
              key={`${d}-${i}`}
              className={[
                "flex h-9 items-center justify-center rounded-lg text-xs font-bold transition-colors",
                active === i
                  ? "bg-zinc-900 text-white"
                  : "bg-white text-zinc-500",
              ].join(" ")}
            >
              {d}
            </div>
          ))}
        </div>
        <button
          type="button"
          className={[
            "mt-4 w-full rounded-full py-2.5 text-sm font-semibold transition-colors",
            saved
              ? "bg-zinc-900 text-white"
              : "border border-[#ebebeb] bg-white text-zinc-800",
          ].join(" ")}
        >
          {saved ? "Accès débloqué" : "Débloquer"}
        </button>
        <svg
          className="pointer-events-none absolute left-0 top-0 h-full w-full"
          aria-hidden
        >
          <g
            style={{
              transform: `translate(${cursor.x}px, ${cursor.y}px) scale(${cursor.press ? 0.95 : 1})`,
              transition: "transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          >
            <path
              d="M4 2 L4 22 L10 16 L14 26 L17 25 L13 15 L22 15 Z"
              fill="#18181b"
              stroke="#fff"
              strokeWidth="1"
            />
          </g>
        </svg>
      </div>
    </article>
  );
}

export function LandingFeatures() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".feat-card", {
        y: 48,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 75%",
        },
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="fonctionnalites"
      ref={rootRef}
      className="bg-[#f5f5f5] px-4 py-20 sm:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
          Pourquoi LOPANGO
        </p>
        <h2 className="mt-2 max-w-xl text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
          Trois raisons de laisser les démarcheurs de côté
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="feat-card">
            <MixerCard />
          </div>
          <div className="feat-card">
            <TypewriterCard />
          </div>
          <div className="feat-card">
            <SchedulerCard />
          </div>
        </div>
      </div>
    </section>
  );
}
