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
        <h1 className="text-3xl font-black text-zinc-900">Créer un compte</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Rejoignez LOPANGO et commencez à louer ou publier votre maison.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error === "missing-fields"
            ? "Veuillez remplir tous les champs."
            : error}
        </div>
      )}

      <form action={signUp} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Nom complet
          <input
            name="fullName"
            type="text"
            required
            className="rounded-lg border border-zinc-300 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none"
            placeholder="Votre nom et prénom"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Email
          <input
            name="email"
            type="email"
            required
            className="rounded-lg border border-zinc-300 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none"
            placeholder="vous@exemple.com"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Mot de passe
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none"
            placeholder="Au moins 6 caractères"
          />
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-zinc-700">
            Vous êtes ?
          </legend>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm">
            <input type="radio" name="role" value="tenant" defaultChecked />
            Un locataire — je cherche une maison (9 999 FCFA/mois)
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm">
            <input type="radio" name="role" value="owner" />
            Un propriétaire — je veux louer ma maison (12 999 FCFA/mois)
          </label>
        </fieldset>

        <button
          type="submit"
          className="rounded-xl bg-emerald-600 px-6 py-3 text-base font-semibold text-white hover:bg-emerald-500"
        >
          Créer mon compte
        </button>
      </form>

      <p className="text-center text-sm text-zinc-600">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-500">
          Se connecter
        </Link>
      </p>
    </div>
  );
}