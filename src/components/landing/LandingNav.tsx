"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MagneticLink } from "./MagneticLink";

const LINKS = [
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#protocole", label: "Comment ça marche" },
  { href: "#tarifs", label: "Tarifs" },
];

export function LandingNav() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.65);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        solid
          ? "border-b border-[#ebebeb] bg-white/95 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          className={[
            "text-xl font-black tracking-tight transition-colors",
            solid ? "text-zinc-900" : "text-white",
          ].join(" ")}
        >
          LOPANGO
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={[
                "text-sm font-semibold transition-transform hover:-translate-y-px",
                solid ? "text-zinc-600 hover:text-zinc-900" : "text-white/85 hover:text-white",
              ].join(" ")}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            prefetch
            className={[
              "rounded-full px-3 py-2 text-sm font-semibold transition-transform hover:-translate-y-px",
              solid ? "text-zinc-700 hover:bg-zinc-100" : "text-white/90 hover:bg-white/10",
            ].join(" ")}
          >
            Connexion
          </Link>
          {solid ? (
            <MagneticLink href="/register" variant="primary" className="!py-2 !px-4">
              S&apos;inscrire
            </MagneticLink>
          ) : (
            <MagneticLink href="/register" variant="onDark" className="!py-2 !px-4">
              S&apos;inscrire
            </MagneticLink>
          )}
        </div>
      </div>
    </header>
  );
}
