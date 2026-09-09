import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateHouse } from "@/app/actions/houses";

export const dynamic = "force-dynamic";

export default async function EditHousePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: house } = await supabase
    .from("houses")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!house) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link href="/dashboard/houses" className="text-sm text-zinc-500 hover:text-zinc-900">
        ← Retour à mes maisons
      </Link>
      <h1 className="mt-4 text-3xl font-black text-zinc-900">
        Modifier : {house.title}
      </h1>

      <form action={updateHouse} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="id" value={house.id} />

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Titre de l&apos;annonce *
          <input
            name="title"
            type="text"
            required
            defaultValue={house.title}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Description
          <textarea
            name="description"
            rows={4}
            defaultValue={house.description ?? ""}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none"
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
              defaultValue={house.price}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
            Ville
            <input
              name="city"
              type="text"
              defaultValue={house.city ?? ""}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
            Quartier
            <input
              name="neighborhood"
              type="text"
              defaultValue={house.neighborhood ?? ""}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
            Adresse
            <input
              name="address"
              type="text"
              defaultValue={house.address ?? ""}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Numéro de téléphone à afficher *
          <input
            name="contactPhone"
            type="tel"
            required
            defaultValue={house.contact_phone ?? ""}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Statut
          <select
            name="status"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none"
          >
            <option value="active" selected={house.status === "active"}>
              En ligne — visible par les locataires
            </option>
            <option value="inactive" selected={house.status === "inactive"}>
              Masquée — pas visible
            </option>
          </select>
        </label>

        <button
          type="submit"
          className="mt-2 rounded-xl bg-emerald-600 px-6 py-3 text-base font-semibold text-white hover:bg-emerald-500"
        >
          Enregistrer les modifications
        </button>
      </form>
    </div>
  );
}