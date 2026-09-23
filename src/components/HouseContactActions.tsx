"use client";

import { Icon } from "@/components/Icon";
import { newId, type SellerHouse } from "@/lib/mock/houses";
import { getHouse, getProfile, saveContact, saveHouse } from "@/lib/mock/store";
import { fbqTrack } from "@/lib/analytics/fbq";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Zone contact d'une fiche DÉBLOQUÉE (abonné ou démarcheur propriétaire).
 * Rendue uniquement quand l'accès a été validé côté serveur.
 */
export default function HouseContactActions({ houseId }: { houseId: string }) {
  const [composeOpen, setComposeOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [house, setHouse] = useState<SellerHouse | null>(null);
  const tracked = useRef(false);

  const loadHouse = useCallback(() => {
    setHouse(getHouse(houseId) ?? null);
  }, [houseId]);

  useEffect(() => {
    loadHouse();
  }, [loadHouse]);

  // ViewContent : une fiche maison a été consultée.
  useEffect(() => {
    if (!house || tracked.current) return;
    tracked.current = true;
    fbqTrack("ViewContent", {
      content_name: house.title,
      content_type: "product",
      content_ids: [house.id],
      value: house.price,
      currency: "XAF",
      city: house.city,
    });
  }, [house]);

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!house) return;
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
    // Contact : message envoyé au propriétaire — signal d'intention très fort.
    fbqTrack("Contact", {
      content_name: house.title,
      content_type: "product",
      content_ids: [house.id],
    });
    setTimeout(() => setSent(false), 2500);
  }

  return (
    <>
      <div className="mt-3 border-t border-[#ebebeb] pt-3">
        <button
          type="button"
          aria-label="Envoyer un message au vendeur"
          onClick={() => {
            setComposeOpen((o) => !o);
            setError(null);
          }}
          className={`flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold ${
            composeOpen ? "bg-zinc-900 text-white" : "bg-[#f5f5f5] text-zinc-900"
          }`}
        >
          <Icon name="message" className="h-4 w-4" />
          Message au propriétaire
        </button>
      </div>

      {sent && (
        <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-center text-xs font-semibold text-emerald-700">
          Message envoyé — le vendeur le voit dans Messages.
        </p>
      )}

      {composeOpen && (
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
          {error && <p className="text-xs font-medium text-red-600">{error}</p>}
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 py-3 text-sm font-semibold text-white"
          >
            <Icon name="send" className="h-4 w-4" />
            Envoyer
          </button>
        </form>
      )}
    </>
  );
}
