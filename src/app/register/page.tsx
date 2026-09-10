import Link from "next/link";
import { signUp } from "@/app/actions/auth";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; role?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;
  const defaultRole = params.role === "owner" ? "owner" : "tenant";

  const field =
    "w-full rounded-2xl border border-[#ebebeb] bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400";

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
          <h1 className="mt-4 text-2xl font-bold text-zinc-900">
            Créer un compte
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Prénom + nom, et c&apos;est tout. Identifiant et mot de passe
            générés automatiquement — pas d&apos;email.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error === "missing-fields"
              ? "Veuillez remplir tous les champs."
              : error}
          </div>
        )}

        <form
          action={signUp}
          className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm"
        >
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                Prénom
              </span>
              <input
                name="firstName"
                type="text"
                required
                autoComplete="given-name"
                className={field}
                placeholder="Jean"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                Nom
              </span>
              <input
                name="lastName"
                type="text"
                required
                autoComplete="family-name"
                className={field}
                placeholder="Dupont"
              />
            </label>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              Vous êtes ?
            </legend>
            <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[#ebebeb] px-3 py-2.5 text-sm text-zinc-800">
              <input
                type="radio"
                name="role"
                value="tenant"
                defaultChecked={defaultRole === "tenant"}
              />
              Locataire — je cherche une maison
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[#ebebeb] px-3 py-2.5 text-sm text-zinc-800">
              <input
                type="radio"
                name="role"
                value="owner"
                defaultChecked={defaultRole === "owner"}
              />
              Propriétaire — je publie des annonces
            </label>
          </fieldset>

          <button
            type="submit"
            className="rounded-full bg-zinc-900 py-3.5 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Créer mon compte en un clic
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          Déjà un compte ?{" "}
          <Link
            href="/login"
            className="font-semibold text-zinc-900 underline-offset-2 hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
