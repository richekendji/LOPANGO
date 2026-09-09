import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CURRENCY } from "@/lib/pricing";
import { submitContact } from "@/app/actions/contact";

export const dynamic = "force-dynamic";

export default async function HouseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: house } = await supabase
    .from("houses")
    .select("*, house_photos(url, position)")
    .eq("id", id)
    .maybeSingle();

  if (!house) {
    notFound();
  }

  // Récupère le numéro du propriétaire pour l'afficher
  let ownerPhone: string | null = null;
  if (house.owner_id) {
    const { data: ownerProfile } = await supabase
      .from("profiles")
      .select("phone")
      .eq("id", house.owner_id)
      .maybeSingle();
    ownerPhone = ownerProfile?.phone ?? null;
  }

  const photos = house.house_photos ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Galerie */}
      <div className="grid gap-4 sm:grid-cols-2">
        {photos.length > 0 ? (
          photos.map((p: { url: string }) => (
            <div key={p.url} className="relative h-52 w-full overflow-hidden rounded-2xl sm:h-64">
              <Image
                src={p.url}
                alt={house.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          ))
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
            Pas de photos disponibles
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-8 sm:mt-8 md:grid-cols-3">
        {/* Détails */}
        <div className="md:col-span-2">
          <h1 className="text-2xl font-black text-zinc-900 sm:text-3xl">{house.title}</h1>
          <p className="mt-2 text-lg font-bold text-emerald-600">
            {house.price.toLocaleString("fr-FR")} {CURRENCY}
            <span className="text-sm font-normal text-zinc-500">/mois</span>
          </p>

          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl bg-zinc-50 p-3">
              <dt className="text-zinc-500">Ville</dt>
              <dd className="font-semibold text-zinc-900">{house.city ?? "—"}</dd>
            </div>
            <div className="rounded-xl bg-zinc-50 p-3">
              <dt className="text-zinc-500">Quartier</dt>
              <dd className="font-semibold text-zinc-900">
                {house.neighborhood ?? "—"}
              </dd>
            </div>
            {house.address && (
              <div className="col-span-2 rounded-xl bg-zinc-50 p-3">
                <dt className="text-zinc-500">Adresse</dt>
                <dd className="font-semibold text-zinc-900">{house.address}</dd>
              </div>
            )}
          </dl>

          <h2 className="mt-8 text-xl font-bold text-zinc-900">Description</h2>
          <p className="mt-2 whitespace-pre-wrap text-zinc-600">
            {house.description || "Aucune description pour cette maison."}
          </p>
        </div>

        {/* Contact */}
        <aside className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-bold text-zinc-900">
            Contacter le propriétaire
          </h2>

          {query.sent && (
            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              Message envoyé ! Le propriétaire vous répondra rapidement.
            </div>
          )}
          {query.error && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Une erreur est survenue. Réessayez.
            </div>
          )}

          {user ? (
            <form action={submitContact} className="mt-4 flex flex-col gap-3">
              <input type="hidden" name="houseId" value={house.id} />
              <label className="text-sm font-medium text-zinc-700">
                Votre nom
                <input
                  name="name"
                  type="text"
                  required
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </label>
              <label className="text-sm font-medium text-zinc-700">
                Votre numéro
                <input
                  name="phone"
                  type="tel"
                  required
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                  placeholder="+242 ..."
                />
              </label>
              <label className="text-sm font-medium text-zinc-700">
                Message
                <textarea
                  name="message"
                  rows={4}
                  required
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                  placeholder="Bonjour, je suis intéressé par votre maison..."
                />
              </label>
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-500"
              >
                Envoyer ma demande
              </button>
            </form>
          ) : (
            <div className="mt-4 rounded-lg bg-zinc-50 p-4 text-sm text-zinc-600">
              <p>
                Connectez-vous pour contacter le propriétaire de cette maison.
              </p>
              <a
                href={`/login?next=/houses/${house.id}`}
                className="mt-2 inline-block font-semibold text-emerald-600 hover:text-emerald-500"
              >
                Se connecter →
              </a>
            </div>
          )}

          {ownerPhone && (
            <div className="mt-6 border-t border-zinc-100 pt-4">
              <p className="text-sm text-zinc-500">
                Vous pouvez aussi appeler directement :
              </p>
              <p className="text-lg font-bold text-zinc-900">{ownerPhone}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}