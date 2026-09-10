import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { clearNewCredentials } from "@/app/actions/auth";

export const dynamic = "force-dynamic";

export default async function RegisterSuccessPage() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("lopango_new_credentials")?.value;

  if (!raw) {
    redirect("/");
  }

  let credentials: { identifier: string; password: string };
  try {
    credentials = JSON.parse(raw);
  } catch {
    redirect("/");
  }

  return (
    <div className="min-h-full bg-[#f5f5f5]">
      <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-10">
        <div className="text-center">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-zinc-900"
          >
            LOPANGO
          </Link>
          <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-2xl text-white">
            ✓
          </div>
          <h1 className="mt-4 text-2xl font-bold text-zinc-900">
            Compte créé !
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Notez ces identifiants — ils ne s&apos;afficheront qu&apos;une seule
            fois. Pas d&apos;email à retenir.
          </p>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-2 ring-zinc-900">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              Votre identifiant
            </p>
            <p className="mt-1 select-all font-mono text-xl font-bold text-zinc-900">
              {credentials.identifier}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              Votre mot de passe
            </p>
            <p className="mt-1 select-all font-mono text-xl font-bold text-zinc-900">
              {credentials.password}
            </p>
          </div>
        </div>

        <form action={clearNewCredentials}>
          <button
            type="submit"
            className="w-full rounded-full bg-zinc-900 py-3.5 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Accéder à l&apos;app
          </button>
        </form>

        <p className="text-center text-xs text-zinc-400">
          Vous êtes déjà connecté. Conservez ces identifiants en lieu sûr.
        </p>
      </div>
    </div>
  );
}
