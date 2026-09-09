import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
import MobileNav from "@/components/MobileNav";

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/90">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">
          LOPANGO
        </Link>

        {/* Desktop : liens horizontaux */}
        <nav className="hidden items-center gap-2 text-sm font-medium md:flex">
          <Link href="/" className="rounded-md px-3 py-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white">
            Accueil
          </Link>
          <Link href="/houses" className="rounded-md px-3 py-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white">
            Maisons
          </Link>

          {user ? (
            <>
              <Link href="/dashboard" className="rounded-md bg-zinc-900 px-3 py-2 text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
                Mon espace
              </Link>
              <Link href="/dashboard/profile" className="rounded-md px-3 py-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white">
                Profil
              </Link>
              <form action={signOut}>
                <button type="submit" className="rounded-md px-3 py-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white">
                  Déconnexion
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-md px-3 py-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white">
                Connexion
              </Link>
              <Link href="/register" className="rounded-md bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-500">
                S&apos;inscrire
              </Link>
            </>
          )}
        </nav>

        {/* Mobile : menu burger */}
        <MobileNav isAuthenticated={!!user} />
      </div>
    </header>
  );
}
