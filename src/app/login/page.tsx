import Link from "next/link";
import { signIn } from "@/app/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; registered?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12 sm:px-6">
      <div className="text-center">
        <h1 className="text-3xl font-black text-zinc-900">Connexion</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Heureux de vous revoir sur LOPANGO.
        </p>
      </div>

      {params.registered && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          Compte créé ! Vérifiez vos emails pour confirmer votre adresse, puis
          connectez-vous.
        </div>
      )}

      {params.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {params.error === "missing-fields"
            ? "Veuillez remplir tous les champs."
            : params.error}
        </div>
      )}

      <form action={signIn} className="flex flex-col gap-4">
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
            className="rounded-lg border border-zinc-300 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none"
            placeholder="Votre mot de passe"
          />
        </label>

        <button
          type="submit"
          className="rounded-xl bg-emerald-600 px-6 py-3 text-base font-semibold text-white hover:bg-emerald-500"
        >
          Se connecter
        </button>
      </form>

      <p className="text-center text-sm text-zinc-600">
        Pas encore de compte ?{" "}
        <Link href="/register" className="font-semibold text-emerald-600 hover:text-emerald-500">
          S&apos;inscrire
        </Link>
      </p>
    </div>
  );
}