"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "@/app/actions/auth";

/**
 * Version mobile de la navbar : menu burger pleine largeur.
 * Le logo + burger sur une ligne, les liens dans un panneau déroulant.
 */
export default function MobileNav({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Ferme le menu à chaque navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Empêche le scroll du body quand le menu est ouvert
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const linkClass = (href: string) =>
    `block rounded-lg px-4 py-3 text-base font-medium ${
      pathname === href
        ? "bg-emerald-50 text-emerald-700"
        : "text-zinc-700 hover:bg-zinc-100"
    }`;

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg border border-zinc-300"
      >
        <span
          className={`block h-0.5 w-5 bg-zinc-700 transition-transform ${
            open ? "translate-y-2 rotate-45" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-5 bg-zinc-700 transition-opacity ${
            open ? "opacity-0" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-5 bg-zinc-700 transition-transform ${
            open ? "-translate-y-2 -rotate-45" : ""
          }`}
        />
      </button>

      {open && (
        <nav className="absolute inset-x-0 top-full z-50 border-b border-zinc-200 bg-white shadow-lg">
          <nav className="flex flex-col gap-1 p-4">
            <Link href="/" className={linkClass("/")}>
              Accueil
            </Link>
            <Link href="/houses" className={linkClass("/houses")}>
              Maisons
            </Link>

            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className={linkClass("/dashboard")}>
                  Mon espace
                </Link>
                <Link
                  href="/dashboard/profile"
                  className={linkClass("/dashboard/profile")}
                >
                  Profil
                </Link>
                <form action={signOut} className="mt-2">
                  <button
                    type="submit"
                    className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-left text-base font-medium text-zinc-700 hover:bg-zinc-50"
                  >
                    Déconnexion
                  </button>
                </form>
              </>
            ) : (
              <div className="mt-2 flex flex-col gap-2">
                <Link
                  href="/login"
                  className="rounded-lg border border-zinc-300 px-4 py-3 text-center text-base font-medium text-zinc-700"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-emerald-600 px-4 py-3 text-center text-base font-semibold text-white"
                >
                  S&apos;inscrire
                </Link>
              </div>
            )}
          </nav>
        </nav>
      )}
    </div>
  );
}
