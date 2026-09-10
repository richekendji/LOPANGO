import Link from "next/link";
import { MagneticLink } from "./MagneticLink";

export function LandingFooter() {
  return (
    <footer className="rounded-t-[2rem] bg-zinc-900 px-4 pb-10 pt-14 text-white sm:rounded-t-[3rem] sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-2xl font-black tracking-tight">LOPANGO</p>
          <p className="mt-2 max-w-xs text-sm text-zinc-400">
            Location de maisons au Congo — contact direct, zéro démarcheur.
          </p>
          <MagneticLink href="/register" variant="onDark" className="mt-5">
            Créer mon compte
          </MagneticLink>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            Navigation
          </p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-300">
            <li>
              <a href="#fonctionnalites" className="hover:-translate-y-px hover:text-white">
                Fonctionnalités
              </a>
            </li>
            <li>
              <a href="#protocole" className="hover:-translate-y-px hover:text-white">
                Protocole
              </a>
            </li>
            <li>
              <a href="#tarifs" className="hover:-translate-y-px hover:text-white">
                Tarifs
              </a>
            </li>
            <li>
              <Link href="/app" className="hover:-translate-y-px hover:text-white">
                Ouvrir l&apos;app
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            Compte
          </p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-300">
            <li>
              <Link href="/login" className="hover:text-white">
                Connexion
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-white">
                S&apos;inscrire
              </Link>
            </li>
            <li>
              <Link href="/forgot-password" className="hover:text-white">
                Mot de passe oublié
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
        <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-zinc-500">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Système opérationnel
        </p>
        <p className="text-xs text-zinc-500">
          © {new Date().getFullYear()} LOPANGO — Congo
        </p>
      </div>
    </footer>
  );
}
