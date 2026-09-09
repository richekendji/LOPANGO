import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="text-xl font-black tracking-tight text-zinc-900">
          LOPANGO
        </Link>

        <nav className="flex items-center gap-2 text-sm font-medium">
          <Link href="/" className="rounded-md px-3 py-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900">
            Accueil
          </Link>
          <Link href="/houses" className="rounded-md px-3 py-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900">
            Maisons
          </Link>

          {user ? (
            <>
              <Link href="/dashboard" className="rounded-md bg-zinc-900 px-3 py-2 text-white hover:bg-zinc-700">
                Mon espace
              </Link>
              <Link href="/dashboard/profile" className="rounded-md px-3 py-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900">
                Profil
              </Link>
              <form action={signOut}>
                <button type="submit" className="rounded-md px-3 py-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900">
                  Déconnexion
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-md px-3 py-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900">
                Connexion
              </Link>
              <Link href="/register" className="rounded-md bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-500">
                S&apos;inscrire
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}