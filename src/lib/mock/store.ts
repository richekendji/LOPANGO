"use client";

import {
  SEED_CONTACTS,
  SEED_HOUSES,
  type ContactRequest,
  type HouseStatus,
  type SellerHouse,
} from "@/lib/mock/houses";

const HOUSES_KEY = "lopango_seller_houses_v2";
const CONTACTS_KEY = "lopango_contacts_v2";
const PROFILE_KEY = "lopango_profile_v1";
const SUB_KEY = "lopango_subscription_v1";
const FORM_DRAFT_NEW_KEY = "lopango_house_form_draft_new";
const PAIEMENT_PERIOD_KEY = "lopango_paiement_period_v1";

function formDraftKey(editId?: string | null) {
  return editId ? `lopango_house_form_draft_${editId}` : FORM_DRAFT_NEW_KEY;
}

export type UserRole = "tenant" | "owner";

export type UserProfile = {
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  role: UserRole;
  username: string;
};

export const SEED_PROFILE: UserProfile = {
  firstName: "Jean",
  lastName: "Dupont",
  phone: "+242 06 000 00 00",
  city: "Brazzaville",
  role: "owner",
  username: "jean.dupont4821",
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("lopango-store"));
}

export function getHouses(): SellerHouse[] {
  const stored = readJson<SellerHouse[] | null>(HOUSES_KEY, null);
  if (!stored || stored.length === 0) {
    writeJson(HOUSES_KEY, SEED_HOUSES);
    return SEED_HOUSES;
  }
  // Normalise les anciennes entrées sans houseType / ownerName
  return stored.map((h) => ({
    ...h,
    houseType: h.houseType ?? "Maison",
    ownerName: h.ownerName?.trim() || "Propriétaire",
    showOwnerName: h.showOwnerName ?? true,
  }));
}

export function getHouse(id: string): SellerHouse | undefined {
  return getHouses().find((h) => h.id === id);
}

export function saveHouse(house: SellerHouse) {
  const list = getHouses();
  const idx = list.findIndex((h) => h.id === house.id);
  const next =
    idx >= 0
      ? list.map((h, i) => (i === idx ? house : h))
      : [house, ...list];
  writeJson(HOUSES_KEY, next);
}

export function deleteHouse(id: string) {
  writeJson(
    HOUSES_KEY,
    getHouses().filter((h) => h.id !== id),
  );
  writeJson(
    CONTACTS_KEY,
    getContacts().filter((c) => c.houseId !== id),
  );
}

export function setHouseStatus(id: string, status: HouseStatus) {
  const house = getHouse(id);
  if (!house) return;
  saveHouse({ ...house, status, updatedAt: "À l'instant" });
}

export function getContacts(): ContactRequest[] {
  const stored = readJson<ContactRequest[] | null>(CONTACTS_KEY, null);
  if (!stored) {
    writeJson(CONTACTS_KEY, SEED_CONTACTS);
    return SEED_CONTACTS;
  }
  return stored;
}

export function saveContact(contact: ContactRequest) {
  const list = getContacts();
  const idx = list.findIndex((c) => c.id === contact.id);
  const next =
    idx >= 0
      ? list.map((c, i) => (i === idx ? contact : c))
      : [contact, ...list];
  writeJson(CONTACTS_KEY, next);
}

export function deleteContact(id: string) {
  writeJson(
    CONTACTS_KEY,
    getContacts().filter((c) => c.id !== id),
  );
}

export function getProfile(): UserProfile {
  return readJson<UserProfile>(PROFILE_KEY, SEED_PROFILE);
}

export function saveProfile(profile: UserProfile) {
  writeJson(PROFILE_KEY, profile);
}

/** Abonnement mock — remis à zéro à chaque rechargement complet de page. */
let storeBooted = false;

function bootStoreOnce() {
  if (typeof window === "undefined" || storeBooted) return;
  storeBooted = true;
  // Nouveau chargement de page = non abonné (pour pouvoir retester le parcours)
  localStorage.setItem(SUB_KEY, JSON.stringify({ active: false }));
}

export function hasActiveSubscription(): boolean {
  bootStoreOnce();
  return readJson<{ active: boolean }>(SUB_KEY, { active: false }).active;
}

export function setSubscriptionActive(active: boolean) {
  bootStoreOnce();
  writeJson(SUB_KEY, { active });
}

/** Brouillon formulaire publier / éditer — survit au rechargement. */
export function getHouseFormDraft<T>(editId?: string | null): T | null {
  return readJson<T | null>(formDraftKey(editId), null);
}

export function saveHouseFormDraft<T>(draft: T, editId?: string | null) {
  try {
    writeJson(formDraftKey(editId), draft);
  } catch {
    // Quota localStorage (photos trop lourdes) — on ignore
  }
}

export function clearHouseFormDraft(editId?: string | null) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(formDraftKey(editId));
  window.dispatchEvent(new Event("lopango-store"));
}

export function getPaiementPeriod(): "mensuel" | "annuel" {
  return readJson<"mensuel" | "annuel">(PAIEMENT_PERIOD_KEY, "mensuel");
}

export function savePaiementPeriod(period: "mensuel" | "annuel") {
  writeJson(PAIEMENT_PERIOD_KEY, period);
}

export function subscribeStore(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener("lopango-store", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("lopango-store", handler);
    window.removeEventListener("storage", handler);
  };
}
