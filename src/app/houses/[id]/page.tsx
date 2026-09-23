import Link from "next/link";
import { HouseSpecsGrid } from "@/components/HouseSpecsGrid";
import { MediaCarousel } from "@/components/MediaCarousel";
import HouseContactActions from "@/components/HouseContactActions";
import HouseViewTracker from "@/components/HouseViewTracker";
import {
  formatFcfa,
  getLockedAddressRows,
  maskHouseForPaywall,
  type SellerHouse,
} from "@/lib/mock/houses";
import { getHouseAccess } from "@/app/actions/agents";
import { getMockHouse } from "@/lib/mock/server-houses";

export const dynamic = "force-dynamic";

export default async function HousePublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Décision d'accès 100 % SERVEUR (abonnement DB + agent_houses).
  const access = await getHouseAccess(id);
  const full = await getMockHouse(id);

  const notFound = !full || full.status !== "active";
  if (notFound) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-4">
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-zinc-500">
            Maison introuvable ou non publiée.
          </p>
          <Link
            href="/app"
            className="mt-3 inline-block text-sm font-semibold text-zinc-900"
          >
            ← Retour au feed
          </Link>
        </div>
      </div>
    );
  }

  const house: SellerHouse = full;
  const unlocked = access.unlocked;
  // Sans accès : les données sensibles ne QUITTENT JAMAIS le serveur.
  const visibleHouse = unlocked ? house : maskHouseForPaywall(house);
  const zone = [visibleHouse.neighborhood, visibleHouse.city]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="mx-auto max-w-lg px-4 pb-10 pt-3">
        <Link
          href="/app/search"
          className="mb-3 inline-flex rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-zinc-900 shadow-sm"
        >
          ← Retour
        </Link>

        <div className="space-y-3">
          <MediaCarousel
            photos={visibleHouse.photos}
            videos={visibleHouse.videos ?? []}
            alt={visibleHouse.title}
            className="mx-auto aspect-[9/16] w-full max-w-sm"
          />

          {/* Infos toujours visibles — composition / prix / critères */}
          <div className="rounded-2xl bg-white px-4 py-3.5 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold leading-snug text-zinc-900">
                  {visibleHouse.title}
                </h1>
                {zone && <p className="mt-0.5 text-xs text-zinc-500">{zone}</p>}
                {visibleHouse.houseType && (
                  <span className="mt-1.5 inline-block rounded-full bg-[#f5f5f5] px-2 py-0.5 text-[10px] font-semibold text-zinc-600">
                    {visibleHouse.houseType}
                  </span>
                )}
              </div>
            </div>

            <p className="mt-2.5 text-xl font-bold tabular-nums text-zinc-900">
              {formatFcfa(visibleHouse.price)}
              <span className="text-xs font-normal text-zinc-500"> /mois</span>
              <span className="ml-1.5 text-xs font-semibold text-emerald-700">
                · Négociable
              </span>
            </p>

            {visibleHouse.description && (
              <p className="mt-2.5 whitespace-pre-wrap text-[13px] leading-relaxed text-zinc-600">
                {visibleHouse.description}
              </p>
            )}

            <HouseSpecsGrid house={visibleHouse} />
          </div>

          {/* Adresse + contact — données masquées côté serveur sans abo */}
          <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="px-4 py-3.5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">
                Contact & adresse
              </p>

              <div className="mt-2.5 space-y-2">
                {getLockedAddressRows(visibleHouse).map((row) => (
                  <div
                    key={row.label}
                    className="flex justify-between gap-3 text-[13px]"
                  >
                    <span className="shrink-0 text-zinc-400">{row.label}</span>
                    <span className="max-w-[65%] text-right font-semibold text-zinc-900">
                      {row.value}
                    </span>
                  </div>
                ))}

                {visibleHouse.showOwnerName !== false && (
                  <div className="flex justify-between gap-3 text-[13px]">
                    <span className="text-zinc-400">Propriétaire</span>
                    <span className="font-semibold text-zinc-900">
                      {visibleHouse.ownerName || "•••••"}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 text-[13px]">
                  <span className="text-zinc-400">Numéro</span>
                  {unlocked ? (
                    <a
                      href={`tel:${visibleHouse.phone.replace(/\s/g, "")}`}
                      className="font-semibold text-zinc-900"
                    >
                      {visibleHouse.phone}
                    </a>
                  ) : (
                    <span className="font-semibold text-zinc-900">
                      +242 06 ••• •• ••
                    </span>
                  )}
                </div>
              </div>

              {unlocked && (
                <HouseContactActions houseId={visibleHouse.id} />
              )}
            </div>

            {!unlocked && (
              <div className="flex flex-col items-center justify-center bg-gradient-to-b from-white/40 via-white/85 to-white px-5 py-6">
                <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-700">
                  🔒 Contenu protégé
                </span>
                <p className="mt-2 max-w-[18rem] text-center text-[14px] font-semibold leading-snug text-zinc-900">
                  L&apos;adresse exacte et le numéro du propriétaire sont
                  réservés aux abonnés
                </p>
                <p className="mt-1 max-w-[20rem] text-center text-xs text-zinc-500">
                  Souscris un abonnement pour débloquer le contact de toutes
                  les maisons, sans limite.
                </p>
                <Link
                  href={`/paiement?retour=${encodeURIComponent(`/houses/${visibleHouse.id}`)}&house=${encodeURIComponent(visibleHouse.id)}`}
                  className="mt-4 flex w-full max-w-sm items-center justify-center rounded-full bg-zinc-900 py-3.5 text-sm font-semibold text-white shadow-md active:opacity-90"
                >
                  Débloquer le contact
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      {unlocked && <HouseViewTracker house={visibleHouse} />}
    </div>
  );
}
