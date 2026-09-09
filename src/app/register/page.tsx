import Link from "next/link";
import { signUp } from "@/app/actions/auth";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12 sm:px-6">
      <div className="text-center">
        <h1 className="text-3xl font-black text-zinc-900 dark:text-white">
          Créer un compte
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Un nom, un prénom, et c&apos;est tout. Votre identifiant et votre mot
          de passe sont générés automatiquement.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error === "missing-fields"
            ? "Veuillez remplir tous les champs."
            : error}
        </div>
      )}

      <form action={signUp} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Prénom
            <input
              name="firstName"
              type="text"
              required
              className="rounded-lg border border-zinc-300 px-3 py-2 text-base text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-600 dark:bg-white dark:text-zinc-900 dark:placeholder-zinc-500"
              placeholder="Jean"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Nom
            <input
              name="lastName"
              type="text"
              required
              className="rounded-lg border border-zinc-300 px-3 py-2 text-base text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-600 dark:bg-white dark:text-zinc-900 dark:placeholder-zinc-500"
              placeholder="Dupont"
            />
          </label>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Vous êtes ?
          </legend>
          <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-zinc-300 px-3 py-3 text-sm text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-100">
            <input type="radio" name="role" value="tenant" defaultChecked className="mt-0.5" />
            <span>Un locataire — je cherche une maison (9 999 FCFA/mois)</span>
          </label>
          <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-zinc-300 px-3 py-3 text-sm text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-100">
            <input type="radio" name="role" value="owner" className="mt-0.5" />
            <span>Un propriétaire — je veux louer ma maison (12 999 FCFA/mois)</span>
          </label>
        </fieldset>

        <button
          type="submit"
          className="rounded-xl bg-emerald-600 px-6 py-3.5 text-base font-semibold text-white hover:bg-emerald-500"
        >
          Créer mon compte en un clic
        </button>
      </form>

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-300">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
