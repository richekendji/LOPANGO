import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { clearNewCredentials } from "@/app/actions/auth";

export const dynamic = "force-dynamic";

export default async function RegisterSuccessPage() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("lopango_new_credentials")?.value;

  if (!raw) {
    // Pas de credentials en attente (rafraîchissement ou accès direct)
    redirect("/");
  }

  let credentials: { identifier: string; password: string };
  try {
    credentials = JSON.parse(raw);
  } catch {
    redirect("/");
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12 sm:px-6">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-3xl dark:bg-emerald-900/60">
          ✓
        </div>
        <h1 className="mt-4 text-3xl font-black text-zinc-900 dark:text-white">
          Compte créé !
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Notez précieusement vos identifiants — ils vous serviront à vous
          connecter. Ils ne s&apos;afficheront qu&apos;une seule fois.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-6 dark:bg-emerald-950/40">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
            Votre identifiant
          </p>
          <p className="mt-1 select-all font-mono text-2xl font-bold text-zinc-900 dark:text-white">
            {credentials.identifier}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
            Votre mot de passe
          </p>
          <p className="mt-1 select-all font-mono text-2xl font-bold text-zinc-900 dark:text-white">
            {credentials.password}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <form action={clearNewCredentials}>
          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-600 px-6 py-3 text-center text-base font-semibold text-white hover:bg-emerald-500"
          >
            Accéder à mon espace
          </button>
        </form>
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
          Vous êtes déjà connecté. Conservez ces identifiants en lieu sûr.
        </p>
      </div>
    </div>
  );
}
