import { signOut } from "@/app/actions/auth";

/** Bouton déconnexion réutilisable (server action). */
export function SignOutButton({ className }: { className?: string }) {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className={
          className ??
          "w-full rounded-full border border-red-200 bg-white py-3.5 text-sm font-semibold text-red-600 hover:bg-red-50"
        }
      >
        Se déconnecter
      </button>
    </form>
  );
}
