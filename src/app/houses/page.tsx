import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { CURRENCY } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function HousesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Vérifie si l'utilisateur est un locataire abonné
  let isSubscribedTenant = false;
  if (user) {
    const { data } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("role", "tenant")
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    isSubscribedTenant = !!data;
  }

  // Récupère les maisons actives avec leur première photo
  const { data: houses } = await supabase
    .from("houses")
    .select(
      "id, title, price, city, neighborhood, status, house_photos(url, position)",
    )
    .eq("status", "active")
    .order("created_at", { ascending: false });

  // Si pas abonné, on montre un écran d'information
  if (!isSubscribedTenant) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-xl rounded-2xl border border-zinc-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-900">
            Découvrez les maisons disponibles
          </h1>
          <p className="mt-3 text-zinc-600">
            Pour accéder au catalogue des maisons à louer au Congo-Brazzaville,
            souscrivez à l&apos;abonnement locataire à{" "}
            <strong>9 999 FCFA/mois</strong>.
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Paiement mobile money : MTN MoMo ou Airtel Money.
          </p>
          <Link
            href={user ? "/subscribe?role=tenant" : "/register?role=tenant"}
            className="mt-6 inline-block rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-500"
          >
            {user ? "Souscrire maintenant" : "Créer un compte locataire"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-black text-zinc-900">
        Maisons à louer
      </h1>
      <p className="mt-1 text-zinc-600">
        {houses?.length ?? 0} annonce{houses?.length !== 1 ? "s" : ""}{" "}
        disponible{(houses?.length ?? 0) !== 1 ? "s" : ""}
      </p>

      {!houses || houses.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center text-zinc-500">
          Aucune maison disponible pour le moment. Revenez bientôt !
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {houses.map((house) => {
            const photos: { url: string }[] = Array.isArray(house.house_photos)
              ? house.house_photos
              : [];
            photos.sort((a, b) => a.position - b.position);
            const cover = photos[0]?.url;

            return (
              <Link
                key={house.id}
                href={`/houses/${house.id}`}
                className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:shadow-lg"
              >
                <div className="relative h-48 w-full bg-zinc-100">
                  {cover ? (
                    <Image
                      src={cover}
                      alt={house.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                      Pas de photo
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-zinc-900">
                    {house.title}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    {house.city ?? "Congo"}
                    {house.neighborhood ? ` — ${house.neighborhood}` : ""}
                  </p>
                  <p className="mt-2 text-lg font-bold text-emerald-600">
                    {house.price.toLocaleString("fr-FR")} {CURRENCY}
                    <span className="text-sm font-normal text-zinc-500">/mois</span>
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}