import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";

export async function AuthAccountCard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mt-4 space-y-2 rounded-2xl bg-white px-4 py-4 shadow-sm">
        <p className="text-sm font-bold text-zinc-900">Compte LOPANGO</p>
        <p className="text-sm text-zinc-500">
          Créez un compte en un clic pour garder vos identifiants partout.
        </p>
        <div className="flex gap-2 pt-1">
          <Link
            href="/register"
            className="flex-1 rounded-full bg-zinc-900 py-3 text-center text-sm font-semibold text-white"
          >
            S&apos;inscrire
          </Link>
          <Link
            href="/login"
            className="flex-1 rounded-full border border-[#ebebeb] py-3 text-center text-sm font-semibold text-zinc-800"
          >
            Connexion
          </Link>
        </div>
      </div>
    );
  }

  const username =
    (user.user_metadata?.username as string | undefined) ||
    user.email?.split("@")[0] ||
    "membre";
  const fullName =
    (user.user_metadata?.full_name as string | undefined) || "Membre LOPANGO";

  return (
    <div className="mt-4 space-y-3 rounded-2xl bg-white px-4 py-4 shadow-sm">
      <div>
        <p className="text-sm font-bold text-zinc-900">Connecté</p>
        <p className="mt-0.5 text-sm text-zinc-600">{fullName}</p>
        <p className="font-mono text-xs text-zinc-500">@{username}</p>
      </div>
      <form action={signOut}>
        <button
          type="submit"
          className="w-full rounded-full border border-[#ebebeb] py-3 text-sm font-semibold text-zinc-800"
        >
          Se déconnecter
        </button>
      </form>
    </div>
  );
}
