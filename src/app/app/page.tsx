import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CURRENCY } from "@/lib/pricing";
import BottomNav from "@/components/BottomNav";

export const dynamic = "force-dynamic";

export default async function AppFeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Profil : pour l'avatar et le rappel "complete your profile"
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, role")
    .eq("id", user.id)
    .maybeSingle();

  const profileIncomplete = !profile?.phone;
  const firstName = (profile?.full_name ?? "").split(" ")[0] || "membre";

  // Maisons actives pour le feed
  const { data: houses } = await supabase
    .from("houses")
    .select("id, title, price, city, neighborhood, house_photos(url, position)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(10);

  type HouseRow = {
    id: string;
    title: string;
    price: number;
    city: string | null;
    neighborhood: string | null;
    house_photos: { url: string; position: number | null }[] | null;
  };

  const feed = ((houses ?? []) as unknown as HouseRow[]).map((h) => {
    const photos = Array.isArray(h.house_photos) ? h.house_photos : [];
    const sorted = [...photos].sort(
      (a, b) => (a.position ?? 0) - (b.position ?? 0),
    );
    return { ...h, cover: sorted[0]?.url ?? null };
  });

  return (
    <div className="min-h-screen bg-zinc-50 pb-24 dark:bg-zinc-950">
      {/* Header : localisation */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <button
            type="button"
            aria-label="Mon compte"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
          >
            <span className="text-lg">👤</span>
          </button>

          <div className="flex flex-col items-center">
            <span className="text-[11px] uppercase tracking-wide text-zinc-400">
              Location
            </span>
            <span className="flex items-center gap-1 text-sm font-bold text-zinc-900 dark:text-white">
              <span className="text-red-500">📍</span> Congo
            </span>
          </div>

          <button
            type="button"
            aria-label="Notifications"
            className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-600 dark:text-zinc-300"
          >
            <span className="text-lg">🔔</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4">
        {/* Bannière "complete your profile" */}
        {profileIncomplete && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-950">
              🏡
            </span>
            <Link
              href="/dashboard/profile"
              className="flex-1 text-sm font-medium leading-snug text-zinc-800 dark:text-zinc-100"
            >
              Complete your profile to continue transactions at Heist.
            </Link>
            <Link
              href="/dashboard/profile"
              aria-label="Compléter mon profil"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
            >
              →
            </Link>
          </div>
        )}

        {/* Feed de cartes maisons */}
        <div className="mt-4 space-y-6">
          {feed.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900">
              Aucune maison publiée pour le moment.
              {profile?.role === "owner" && (
                <Link
                  href="/dashboard/houses/new"
                  className="mt-4 block rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white"
                >
                  Publier la première maison
                </Link>
              )}
            </div>
          ) : (
            feed.map((house) => (
              <Link
                key={house.id}
                href={`/houses/${house.id}`}
                className="block active:opacity-90"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-zinc-200 dark:bg-zinc-800">
                  {house.cover ? (
                    <Image
                      src={house.cover}
                      alt={house.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 512px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl text-zinc-400">
                      🏠
                    </div>
                  )}
                  <button
                    type="button"
                    aria-label="Ajouter aux favoris"
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur"
                  >
                    🤍
                  </button>
                </div>
                <div className="flex items-start justify-between gap-3 px-1 pt-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-[15px] font-semibold text-zinc-900 dark:text-white">
                      {house.title}
                    </h2>
                    <p className="truncate text-[13px] text-zinc-500 dark:text-zinc-400">
                      {[house.neighborhood, house.city ?? "Congo"]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                  <p className="shrink-0 text-[17px] font-bold text-zinc-900 dark:text-white">
                    {house.price.toLocaleString("fr-FR")}{" "}
                    <span className="text-xs font-semibold text-zinc-500">
                      {CURRENCY}
                    </span>
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>

      {/* Barre de navigation basse */}
      <BottomNav />
    </div>
  );
}
