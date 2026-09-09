import Link from "next/link";
import { signIn } from "@/app/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; identifier?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12 sm:px-6">
      <div className="text-center">
        <h1 className="text-3xl font-black text-zinc-900 dark:text-white">
          Connexion
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Heureux de vous revoir sur LOPANGO.
        </p>
      </div>

      {params.identifier && !params.error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
          Votre compte est créé. Connectez-vous avec l&apos;identifiant{" "}
          <span className="font-mono font-bold">{params.identifier}</span> et
          le mot de passe qui vous a été montré lors de l&apos;inscription.
        </div>
      )}

      {params.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {params.error === "missing-fields"
            ? "Veuillez remplir tous les champs."
            : params.error}
        </div>
      )}

      <form action={signIn} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-200">
          Identifiant
          <input
            name="identifier"
            type="text"
            required
            autoCapitalize="none"
            autoCorrect="off"
            defaultValue={params.identifier ?? ""}
            className="rounded-lg border border-zinc-300 px-3 py-2 font-mono text-base text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-600 dark:bg-white dark:text-zinc-900 dark:placeholder-zinc-500"
            placeholder="ex : jean.dupont4821"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-200">
          Mot de passe
          <input
            name="password"
            type="password"
            required
            className="rounded-lg border border-zinc-300 px-3 py-2 text-base text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-600 dark:bg-white dark:text-zinc-900 dark:placeholder-zinc-500"
            placeholder="Votre mot de passe"
          />
        </label>

        <button
          type="submit"
          className="rounded-xl bg-emerald-600 px-6 py-3.5 text-base font-semibold text-white hover:bg-emerald-500"
        >
          Se connecter
        </button>
      </form>

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-300">
        Pas encore de compte ?{" "}
        <Link href="/register" className="font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400">
          S&apos;inscrire
        </Link>
      </p>
    </div>
  );
}
