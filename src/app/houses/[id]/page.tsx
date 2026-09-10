"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { HouseSpecsGrid } from "@/components/HouseSpecsGrid";
import { MediaCarousel } from "@/components/MediaCarousel";
import { formatFcfa, getLockedAddressRows, newId, type SellerHouse } from "@/lib/mock/houses";
import {
  getHouse,
  getProfile,
  hasActiveSubscription,
  saveContact,
  saveHouse,
  subscribeStore,
} from "@/lib/mock/store";

function HousePublicContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [house, setHouse] = useState<SellerHouse | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const unlocked = subscribed || searchParams.get("debloque") === "1";
  const [composeOpen, setComposeOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => {
      setHouse(getHouse(id) ?? null);
      setSubscribed(hasActiveSubscription());
    };
    refresh();
    return subscribeStore(refresh);
  }, [id]);

  if (!house || house.status !== "active") {
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

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!house || !unlocked) return;
    const text = message.trim();
    if (!text) {
      setError("Écrivez un message.");
      return;
    }
    const profile = getProfile();
    const name =
      `${profile.firstName} ${profile.lastName}`.trim() || "Locataire";
    saveContact({
      id: newId("c"),
      name,
      phone: profile.phone.trim() || "+242 ",
      message: text,
      houseId: house.id,
      createdAt: "À l'instant",
    });
    saveHouse({
      ...house,
      contacts: (house.contacts ?? 0) + 1,
      updatedAt: "À l'instant",
    });
    setError(null);
    setMessage("");
    setComposeOpen(false);
    setSent(true);
    setTimeout(() => setSent(false), 2500);
  }

  const zone = [house.neighborhood, house.city].filter(Boolean).join(", ");

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
            photos={house.photos}
            videos={house.videos ?? []}
            alt={house.title}
          />

          {/* Infos visibles sans abonnement — composition / prix / critères */}
          <div className="rounded-2xl bg-white px-4 py-3.5 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold leading-snug text-zinc-900">
                  {house.title}
                </h1>
                {zone && (
                  <p className="mt-0.5 text-xs text-zinc-500">{zone}</p>
                )}
                {house.houseType && (
                  <span className="mt-1.5 inline-block rounded-full bg-[#f5f5f5] px-2 py-0.5 text-[10px] font-semibold text-zinc-600">
                    {house.houseType}
                  </span>
                )}
              </div>
            </div>

            <p className="mt-2.5 text-xl font-bold tabular-nums text-zinc-900">
              {formatFcfa(house.price)}
              <span className="text-xs font-normal text-zinc-500"> /mois</span>
              <span className="ml-1.5 text-xs font-semibold text-emerald-700">
                · Négociable
              </span>
            </p>

            {house.description && (
              <p className="mt-2.5 whitespace-pre-wrap text-[13px] leading-relaxed text-zinc-600">
                {house.description}
              </p>
            )}

            <HouseSpecsGrid house={house} />
          </div>

          {/* Adresse + contact — floutés sans abo */}
          <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm">
            <div
              className={`px-4 py-3.5 ${
                unlocked ? "" : "pointer-events-none select-none blur-[8px]"
              }`}
              aria-hidden={!unlocked}
            >
              <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">
                Contact & adresse
              </p>

              <div className="mt-2.5 space-y-2">
                {getLockedAddressRows(house).map((row) => (
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

                {house.showOwnerName !== false && (
                  <div className="flex justify-between gap-3 text-[13px]">
                    <span className="text-zinc-400">Propriétaire</span>
                    <span className="font-semibold text-zinc-900">
                      {house.ownerName || "Propriétaire"}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 text-[13px]">
                  <span className="text-zinc-400">Numéro</span>
                  {unlocked ? (
                    <a
                      href={`tel:${house.phone.replace(/\s/g, "")}`}
                      className="font-semibold text-zinc-900"
                    >
                      {house.phone}
                    </a>
                  ) : (
                    <span className="font-semibold text-zinc-900">
                      {house.phone || "+242 06 ••• •• ••"}
                    </span>
                  )}
                </div>
              </div>

              {unlocked && (
                <div className="mt-3 border-t border-[#ebebeb] pt-3">
                  <button
                    type="button"
                    aria-label="Envoyer un message au vendeur"
                    onClick={() => {
                      setComposeOpen((o) => !o);
                      setError(null);
                    }}
                    className={`flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold ${
                      composeOpen
                        ? "bg-zinc-900 text-white"
                        : "bg-[#f5f5f5] text-zinc-900"
                    }`}
                  >
                    <Icon name="message" className="h-4 w-4" />
                    Message au propriétaire
                  </button>
                </div>
              )}

              {unlocked && sent && (
                <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-center text-xs font-semibold text-emerald-700">
                  Message envoyé — le vendeur le voit dans Messages.
                </p>
              )}

              {unlocked && composeOpen && (
                <form
                  onSubmit={sendMessage}
                  className="mt-3 space-y-2 border-t border-[#ebebeb] pt-3"
                >
                  <textarea
                    className="min-h-24 w-full resize-y rounded-2xl border border-[#ebebeb] bg-[#f5f5f5] px-3 py-2.5 text-sm outline-none focus:border-zinc-400"
                    placeholder="Bonjour, cette maison est-elle encore disponible ?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    autoFocus
                  />
                  {error && (
                    <p className="text-xs font-medium text-red-600">{error}</p>
                  )}
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 py-3 text-sm font-semibold text-white"
                  >
                    <Icon name="send" className="h-4 w-4" />
                    Envoyer
                  </button>
                </form>
              )}
            </div>

            {!unlocked && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-b from-white/30 via-white/75 to-white/95 px-5 py-6">
                <p className="max-w-[18rem] text-center text-[14px] font-semibold leading-snug text-zinc-900">
                  Débloque l&apos;adresse exacte et le numéro du propriétaire
                </p>
                <Link
                  href={`/paiement?retour=${encodeURIComponent(`/houses/${house.id}`)}`}
                  className="mt-4 flex w-full max-w-sm items-center justify-center rounded-full bg-zinc-900 py-3.5 text-sm font-semibold text-white shadow-md active:opacity-90"
                >
                  Débloquer le contact
                </Link>
                <p className="mt-2 text-center text-[11px] text-zinc-500">
                  Composition et prix restent visibles
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HousePublicPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] text-sm text-zinc-500">
          Chargement…
        </div>
      }
    >
      <HousePublicContent />
    </Suspense>
  );
}
