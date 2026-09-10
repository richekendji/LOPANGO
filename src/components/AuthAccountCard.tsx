import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { displayNormalizedPhone } from "@/lib/phone";
import { SignOutButton } from "@/components/SignOutButton";

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
          Inscrivez-vous avec votre numéro pour publier ou contacter.
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

  const fullName =
    (user.user_metadata?.full_name as string | undefined) || "Membre LOPANGO";
  const phone = user.user_metadata?.phone as string | undefined;

  return (
    <div className="mt-4 space-y-3 rounded-2xl bg-white px-4 py-4 shadow-sm">
      <div>
        <p className="text-sm font-bold text-zinc-900">Connecté</p>
        <p className="mt-0.5 text-sm text-zinc-600">{fullName}</p>
        {phone && (
          <p className="font-mono text-xs text-zinc-500">
            {displayNormalizedPhone(phone)}
          </p>
        )}
      </div>
    </div>
  );
}

/** Bloc déconnexion en bas du profil (visible si session active). */
export async function ProfileSignOut() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return (
    <div className="mt-6 space-y-2">
      <SignOutButton />
      <p className="text-center text-[11px] text-zinc-400">
        Vous serez renvoyé à l&apos;accueil LOPANGO.
      </p>
    </div>
  );
}
