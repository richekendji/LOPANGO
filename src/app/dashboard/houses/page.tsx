import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CURRENCY } from "@/lib/pricing";
import { deleteHouse, toggleHouseStatus } from "@/app/actions/houses";

export const dynamic = "force-dynamic";

export default async function MyHousesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: houses } = await supabase
    .from("houses")
    .select("id, title, price, city, neighborhood, status")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-zinc-900">Mes maisons</h1>
          <p className="mt-1 text-zinc-600">
            {houses?.length ?? 0} annonce{(houses?.length ?? 0) !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/dashboard/houses/new"
          className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-500"
        >
          + Ajouter
        </Link>
      </div>

      {!houses || houses.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-zinc-300 p-12 text-center text-zinc-500">
          Vous n&apos;avez pas encore de maison en ligne. Cliquez sur{" "}
          <strong>+ Ajouter</strong> pour publier votre première annonce.
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {houses.map((house) => (
            <div
              key={house.id}
              className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">
                  {house.title}
                </h2>
                <p className="text-sm text-zinc-500">
                  {house.city ?? "Congo"}
                  {house.neighborhood ? ` — ${house.neighborhood}` : ""} ·{" "}
                  {house.price.toLocaleString("fr-FR")} {CURRENCY}/mois
                </p>
                <span
                  className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                    house.status === "active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {house.status === "active" ? "En ligne" : "Masquée"}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <form action={toggleHouseStatus}>
                  <input type="hidden" name="id" value={house.id} />
                  <input type="hidden" name="status" value={house.status} />
                  <button className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50">
                    {house.status === "active" ? "Masquer" : "Publier"}
                  </button>
                </form>
                <Link
                  href={`/dashboard/houses/${house.id}/edit`}
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50"
                >
                  Modifier
                </Link>
                <form action={deleteHouse}>
                  <input type="hidden" name="id" value={house.id} />
                  <button className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                    Supprimer
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}