import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createHouse } from "@/app/actions/houses";

export const dynamic = "force-dynamic";

export default async function NewHousePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link href="/dashboard/houses" className="text-sm text-zinc-500 hover:text-zinc-900">
        ← Retour à mes maisons
      </Link>
      <h1 className="mt-4 text-3xl font-black text-zinc-900">
        Ajouter une maison
      </h1>
      <p className="mt-1 text-sm text-zinc-600">
        Remplissez les informations de votre maison. Vous pourrez ajouter des
        photos juste après.
      </p>

      {params.error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {params.error === "missing-fields"
            ? "Veuillez remplir au minimum le titre et le prix."
            : params.error}
        </div>
      )}

      <form action={createHouse} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Titre de l&apos;annonce *
          <input
            name="title"
            type="text"
            required
            className="rounded-lg border border-zinc-300 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none"
            placeholder="Ex : Villa 3 chambres à Moungali"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Description
          <textarea
            name="description"
            rows={4}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none"
            placeholder="Décrivez la maison : nombre de pièces, équipements, état..."
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
            Loyer mensuel (FCFA) *
            <input
              name="price"
              type="number"
              required
              min={0}
              step={500}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none"
              placeholder="Ex : 75000"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
            Ville
            <input
              name="city"
              type="text"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none"
              placeholder="Ex : Brazzaville"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
            Quartier
            <input
              name="neighborhood"
              type="text"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none"
              placeholder="Ex : Moungali"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
            Adresse
            <input
              name="address"
              type="text"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none"
              placeholder="Rue, numéro..."
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Numéro de téléphone à afficher *
          <input
            name="contactPhone"
            type="tel"
            required
            className="rounded-lg border border-zinc-300 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none"
            placeholder="+242 06 000 00 00"
          />
        </label>

        <button
          type="submit"
          className="mt-2 rounded-xl bg-emerald-600 px-6 py-3 text-base font-semibold text-white hover:bg-emerald-500"
        >
          Créer l&apos;annonce
        </button>
      </form>
    </div>
  );
}