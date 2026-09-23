"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  CITIES,
  HOUSE_TYPES,
  buildHouseTitle,
  composeAddress,
  formatFcfa,
  newId,
  type HouseStatus,
  type HouseType,
  type SellerHouse,
} from "@/lib/mock/houses";
import {
  clearHouseFormDraft,
  getHouseFormDraft,
  getProfile,
  hasActiveSubscription,
  refreshSubscriptionStatus,
  saveHouse,
  saveHouseFormDraft,
} from "@/lib/mock/store";
import { fileToPersistentUrl } from "@/lib/images";
import { fbqTrack } from "@/lib/analytics/fbq";
import {
  compressAndStoreVideo,
  deleteVideoBlob,
  resolveVideoUrl,
} from "@/lib/video";
import { SelectField } from "@/components/SelectField";
import { normalizePhone } from "@/lib/phone";
import { registerAgentHouse } from "@/app/actions/agents";

type FormState = {
  description: string;
  price: string;
  phone: string;
  showOwnerName: boolean;
  city: string;
  neighborhood: string;
  street: string;
  avenue: string;
  reference: string;
  houseType: HouseType;
  bedrooms: string;
  kitchens: string;
  livingRooms: string;
  showerInHouse: boolean;
  showers: string;
  housesOnPlot: string;
  photos: string[];
  videos: string[];
};

function emptyForm(): FormState {
  return {
    description: "",
    price: "",
    phone: "+242 ",
    showOwnerName: true,
    city: "Brazzaville",
    neighborhood: "",
    street: "",
    avenue: "",
    reference: "",
    houseType: "Maison",
    bedrooms: "",
    kitchens: "",
    livingRooms: "",
    showerInHouse: true,
    showers: "",
    housesOnPlot: "1",
    photos: [],
    videos: [],
  };
}

function fromHouse(h: SellerHouse): FormState {
  return {
    description: h.description,
    price: String(h.price),
    phone: h.phone,
    showOwnerName: h.showOwnerName ?? true,
    city: h.city,
    neighborhood: h.neighborhood,
    street: h.street ?? "",
    avenue: h.avenue ?? "",
    reference: h.reference ?? "",
    houseType: h.houseType ?? "Maison",
    bedrooms: String(h.bedrooms ?? ""),
    kitchens: String(h.kitchens ?? ""),
    livingRooms: String(h.livingRooms ?? ""),
    showerInHouse: h.showerInHouse ?? true,
    showers: String(h.showers ?? ""),
    housesOnPlot: String(h.housesOnPlot ?? 1),
    photos: h.photos,
    videos: h.videos ?? [],
  };
}

function isValidDraft(d: Partial<FormState> | null): d is FormState {
  return !!d && typeof d === "object" && Array.isArray(d.photos);
}

function loadInitialForm(
  initial?: SellerHouse,
  houseId?: string | null,
): FormState {
  if (typeof window === "undefined") {
    return initial ? fromHouse(initial) : emptyForm();
  }
  const draft = getHouseFormDraft<FormState>(houseId ?? null);
  // Ignore les brouillons de l’ancien formulaire (titre / caractéristiques libres)
  if (isValidDraft(draft) && typeof draft.bedrooms === "string") {
    return {
      ...emptyForm(),
      ...draft,
      houseType: draft.houseType ?? "Maison",
      street: draft.street ?? "",
      avenue: draft.avenue ?? "",
      reference: draft.reference ?? "",
      photos: draft.photos ?? [],
      videos: draft.videos ?? [],
      showerInHouse: draft.showerInHouse ?? true,
      housesOnPlot: draft.housesOnPlot ?? "1",
    };
  }
  return initial ? fromHouse(initial) : emptyForm();
}

function parseCount(raw: string): number {
  const n = Number(String(raw).trim());
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : NaN;
}

export function HouseForm({
  initial,
  houseId,
}: {
  initial?: SellerHouse;
  houseId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const draftId = houseId ?? initial?.id ?? null;
  const [form, setForm] = useState<FormState>(() =>
    loadInitialForm(initial, draftId),
  );
  const [error, setError] = useState<string | null>(null);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoProgress, setVideoProgress] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [isAgent, setIsAgent] = useState(false);
  const [agentPhone, setAgentPhone] = useState<string | null>(null);
  const [phoneWarning, setPhoneWarning] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const priceNum = Number(form.price.replace(/\s/g, "")) || 0;

  useEffect(() => {
    setReady(true);
    // Statut démarcheur : publication sans paywall + message « vrai numéro ».
    fetch("/api/agent/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { agent?: boolean; agentPhone?: string } | null) => {
        setIsAgent(Boolean(d?.agent));
        setAgentPhone(d?.agentPhone ? normalizePhone(d.agentPhone) : null);
      })
      .catch(() => {
        setIsAgent(false);
        setAgentPhone(null);
      });
  }, []);

  // Re-vérifie le numéro dès que le statut agent est connu
  useEffect(() => {
    if (agentPhone) checkOwnPhone(form.phone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentPhone]);

  useEffect(() => {
    if (!ready) return;
    saveHouseFormDraft(form, draftId);
  }, [form, draftId, ready]);

  function checkOwnPhone(phoneRaw: string) {
    if (!isAgent || !agentPhone) {
      setPhoneWarning(null);
      return false;
    }
    const entered = normalizePhone(phoneRaw);
    const isOwn = Boolean(entered && entered === agentPhone);
    setPhoneWarning(
      isOwn
        ? "⚠️ C'est TON numéro de démarcheur. Mets le VRAI numéro du propriétaire et non le tien — tu es en train de rompre le contrat de manière malhonnête."
        : null,
    );
    return isOwn;
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === "phone" && typeof value === "string") {
      checkOwnPhone(value);
    }
  }

  function showError(message: string) {
    setError(message);
    requestAnimationFrame(() => {
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  async function onPhotosSelected(files: FileList | null) {
    if (!files?.length) return;
    setPhotosLoading(true);
    setError(null);
    try {
      const urls = await Promise.all(
        Array.from(files).map((f) => fileToPersistentUrl(f)),
      );
      setForm((f) => ({ ...f, photos: [...f.photos, ...urls] }));
    } catch {
      showError("Impossible de lire une des photos. Réessayez.");
    } finally {
      setPhotosLoading(false);
    }
  }

  function removePhoto(url: string) {
    update(
      "photos",
      form.photos.filter((p) => p !== url),
    );
  }

  async function onVideosSelected(files: FileList | null) {
    if (!files?.length) return;
    const remaining = Math.max(0, 2 - form.videos.length);
    if (remaining === 0) {
      showError("Maximum 2 vidéos par annonce.");
      return;
    }
    setVideoLoading(true);
    setError(null);
    try {
      const picked = Array.from(files).slice(0, remaining);
      const refs: string[] = [];
      for (const file of picked) {
        if (!file.type.startsWith("video/")) {
          showError("Seuls les fichiers vidéo sont acceptés.");
          continue;
        }
        const ref = await compressAndStoreVideo(file, setVideoProgress);
        refs.push(ref);
      }
      if (refs.length) {
        setForm((f) => ({ ...f, videos: [...f.videos, ...refs] }));
      }
    } catch (err) {
      showError(
        err instanceof Error
          ? err.message
          : "Impossible d’importer la vidéo. Réessayez.",
      );
    } finally {
      setVideoLoading(false);
      setVideoProgress(null);
    }
  }

  async function removeVideo(ref: string) {
    await deleteVideoBlob(ref);
    update(
      "videos",
      form.videos.filter((v) => v !== ref),
    );
  }

  function validate(): string | null {
    const bedrooms = parseCount(form.bedrooms);
    const kitchens = parseCount(form.kitchens);
    const livingRooms = parseCount(form.livingRooms);
    const showers = parseCount(form.showers);
    const housesOnPlot = parseCount(form.housesOnPlot);

    if (!Number.isFinite(bedrooms)) {
      return "Indique le nombre de chambres.";
    }
    if (!Number.isFinite(kitchens)) {
      return "Indique le nombre de cuisines.";
    }
    if (!Number.isFinite(livingRooms)) {
      return "Indique le nombre de salons.";
    }
    if (!Number.isFinite(showers)) {
      return "Indique le nombre de douches.";
    }
    if (!Number.isFinite(housesOnPlot) || housesOnPlot < 1) {
      return "Indique le nombre de maisons dans la parcelle (min. 1).";
    }
    if (form.showerInHouse && showers < 1) {
      return "Si la douche est dans la maison, indique au moins 1 douche.";
    }
    if (!form.price.trim() || !priceNum || priceNum <= 0) {
      return "Le prix mensuel est obligatoire.";
    }
    const phone = form.phone.trim();
    if (!phone || phone === "+242" || phone === "+242 ") {
      return "Le téléphone est obligatoire.";
    }
    if (!form.city.trim()) return "La ville est obligatoire.";
    if (!form.houseType) return "Le type de maison est obligatoire.";
    if (!form.neighborhood.trim()) return "Le quartier est obligatoire.";
    if (!form.street.trim()) return "Le nom de la rue est obligatoire.";
    if (!form.avenue.trim()) return "L’avenue est obligatoire.";
    if (!form.reference.trim()) return "La référence est obligatoire.";
    if (form.photos.length < 1) return "Ajoutez au moins une photo.";
    return null;
  }

  function buildHouse(status: HouseStatus): SellerHouse | null {
    const message = validate();
    if (message) {
      showError(message);
      return null;
    }
    const profile = getProfile();
    const ownerName =
      `${profile.firstName} ${profile.lastName}`.trim() ||
      initial?.ownerName ||
      "Propriétaire";
    const bedrooms = parseCount(form.bedrooms);
    const kitchens = parseCount(form.kitchens);
    const livingRooms = parseCount(form.livingRooms);
    const showers = parseCount(form.showers);
    const housesOnPlot = parseCount(form.housesOnPlot);
    const street = form.street.trim();
    const avenue = form.avenue.trim();
    const reference = form.reference.trim();
    const neighborhood = form.neighborhood.trim();

    setError(null);
    const partial = {
      houseType: form.houseType,
      bedrooms,
      neighborhood,
      city: form.city,
    };
    return {
      id: houseId ?? initial?.id ?? newId("house"),
      title: buildHouseTitle(partial),
      description: form.description.trim(),
      price: priceNum,
      phone: form.phone.trim(),
      ownerName,
      showOwnerName: form.showOwnerName,
      city: form.city,
      neighborhood,
      street,
      avenue,
      reference,
      address: composeAddress({ street, avenue, reference, neighborhood }),
      houseType: form.houseType,
      photos: form.photos,
      videos: form.videos,
      bedrooms,
      kitchens,
      livingRooms,
      showerInHouse: form.showerInHouse,
      showers: form.showerInHouse ? showers : 0,
      housesOnPlot,
      features: [],
      status,
      contacts: initial?.contacts ?? 0,
      updatedAt: "À l'instant",
    };
  }

  async function submit(status: HouseStatus) {
    if (submitting) return;
    setSubmitting(true);
    try {
      const house = buildHouse(status);
      if (!house) return;

      // Démarcheur : interdit de publier avec SON propre numéro
      if (isAgent && checkOwnPhone(house.phone)) {
        showError(
          "C'est TON numéro de démarcheur. Mets le VRAI numéro du propriétaire et non le tien — tu es en train de rompre le contrat de manière malhonnête.",
        );
        return;
      }

      if (status === "active" && !isAgent) {
        // Cache d'abord (déjà rafraîchi au chargement de la page) :
        // publication instantanée pour les abonnés, zéro aller-retour réseau.
        let active = hasActiveSubscription();
        if (!active) active = await refreshSubscriptionStatus();
        if (!active) {
          saveHouseFormDraft(form, draftId);
          const retour = pathname || "/dashboard/houses/new";
          router.push(
            `/paiement?contexte=publier&retour=${encodeURIComponent(retour)}`,
          );
          return;
        }
      }

      // Sauvegarde locale — un dépassement de quota localStorage
      // (photos base64 lourdes) ne doit plus bloquer la publication.
      try {
        saveHouse(house);
        clearHouseFormDraft(draftId);
        if (!draftId) clearHouseFormDraft(null);
      } catch {
        showError(
          "Impossible d'enregistrer l'annonce localement (stockage plein). Supprime des photos lourdes ou libère de l'espace puis réessaie.",
        );
        return;
      }

      // Démarcheur : lie l'annonce à son compte (commission 4 500 à la 1ʳᵉ
      // conversion payante). En ARRIÈRE-PLAN : la navigation n'attend pas
      // Supabase — publier doit être instantané.
      if (isAgent) {
        void registerAgentHouse(house.id)
          .then((link) => {
            if (!link.ok) {
              console.warn(
                "[HouseForm] lien commission échoué:",
                link.error,
              );
            }
          })
          .catch(() => {
            /* best-effort — l'annonce est déjà sauvée */
          });
      }

      // Lead : une maison vient d'être publiée (conversion côté propriétaire).
      if (status === "active") {
        fbqTrack("Lead", {
          content_name: house.title,
          content_type: "product",
          content_ids: [house.id],
          value: house.price,
          currency: "XAF",
          city: house.city,
        });
      }

      router.push(`/dashboard/houses/${house.id}`);
    } finally {
      setSubmitting(false);
    }
  }

  const field =
    "w-full rounded-2xl border border-[#ebebeb] bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400";

  const req = (
    <span className="text-red-500" aria-hidden>
      *
    </span>
  );

  return (
    <div className="space-y-5">
      <div ref={errorRef} className="scroll-mt-4">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : (
          <p className="text-xs text-zinc-500">
            Tous les champs marqués {req} sont obligatoires. Tes saisies sont
            sauvegardées automatiquement si tu recharges la page.
          </p>
        )}
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Ville {req}
        </span>
        <SelectField
          required
          value={form.city}
          onChange={(e) => update("city", e.target.value)}
        >
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </SelectField>
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Quartier {req}
          </span>
          <input
            className={field}
            required
            value={form.neighborhood}
            onChange={(e) => update("neighborhood", e.target.value)}
            placeholder="Moungali"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Nom de la rue {req}
          </span>
          <input
            className={field}
            required
            value={form.street}
            onChange={(e) => update("street", e.target.value)}
            placeholder="Rue des Flamboyants"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Avenue {req}
          </span>
          <input
            className={field}
            required
            value={form.avenue}
            onChange={(e) => update("avenue", e.target.value)}
            placeholder="Avenue de l’Indépendance"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Référence {req}
          </span>
          <input
            className={field}
            required
            value={form.reference}
            onChange={(e) => update("reference", e.target.value)}
            placeholder="Face au marché, derrière l’école…"
          />
        </label>
      </div>
      <p className="text-xs text-zinc-500">
        Rue, avenue et référence restent floutés jusqu’au paiement du
        locataire.
      </p>

      <section className="rounded-[1.5rem] bg-white p-4 shadow-sm">
        <h2 className="text-sm font-bold text-zinc-900">
          Composition {req}
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Ces infos apparaissent en premier et aident les locataires à chercher.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <CountField
            label="Chambres"
            value={form.bedrooms}
            onChange={(v) => update("bedrooms", v)}
            fieldClass={field}
            required
          />
          <CountField
            label="Cuisines"
            value={form.kitchens}
            onChange={(v) => update("kitchens", v)}
            fieldClass={field}
            required
          />
          <CountField
            label="Salons"
            value={form.livingRooms}
            onChange={(v) => update("livingRooms", v)}
            fieldClass={field}
            required
          />
          <CountField
            label="Douches"
            value={form.showers}
            onChange={(v) => update("showers", v)}
            fieldClass={field}
            required
            disabled={!form.showerInHouse}
          />
        </div>

        <label className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-[#ebebeb] px-4 py-3">
          <span className="text-sm font-medium text-zinc-900">
            Douche dans la maison {req}
          </span>
          <input
            type="checkbox"
            checked={form.showerInHouse}
            onChange={(e) => {
              const on = e.target.checked;
              setForm((f) => ({
                ...f,
                showerInHouse: on,
                showers: on ? f.showers || "1" : "0",
              }));
            }}
            className="h-5 w-5 accent-zinc-900"
          />
        </label>

        <div className="mt-3">
          <CountField
            label="Maisons dans la parcelle"
            value={form.housesOnPlot}
            onChange={(v) => update("housesOnPlot", v)}
            fieldClass={field}
            required
            min={1}
          />
        </div>
      </section>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Description{" "}
          <span className="normal-case font-normal text-zinc-400">
            (détails : parking, cour, etc.)
          </span>
        </span>
        <textarea
          className={`${field} min-h-28 resize-y`}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Ex. parking, cour, générateur, proximité marché…"
        />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Prix mensuel (FCFA) {req}
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            className={field}
            required
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
            placeholder="250000"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            {isAgent ? "Numéro du propriétaire" : "Téléphone"} {req}
          </span>
          <input
            className={field}
            required
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="+242 06 …"
          />
          {isAgent && !phoneWarning && (
            <span className="block text-xs text-zinc-500">
              Mets le vrai numéro du propriétaire — pas le tien.
            </span>
          )}
          {phoneWarning && (
            <span className="block rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
              {phoneWarning}
            </span>
          )}
        </label>
      </div>

      <label className="flex items-center justify-between gap-3 rounded-2xl border border-[#ebebeb] bg-white px-4 py-3">
        <span className="text-sm font-medium text-zinc-900">
          Afficher mon nom sur l’annonce
        </span>
        <input
          type="checkbox"
          checked={form.showOwnerName}
          onChange={(e) => update("showOwnerName", e.target.checked)}
          className="h-5 w-5 accent-zinc-900"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Type de maison {req}
        </span>
        <SelectField
          required
          value={form.houseType}
          onChange={(e) => update("houseType", e.target.value as HouseType)}
        >
          {HOUSE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </SelectField>
      </label>

      <section className="rounded-[1.5rem] bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-900">Photos {req}</h2>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white"
          >
            + Ajouter
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              onPhotosSelected(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
        {photosLoading && (
          <p className="mt-3 text-sm text-zinc-500">Import des photos…</p>
        )}
        {!photosLoading && form.photos.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">
            Au moins une photo est obligatoire.
          </p>
        ) : form.photos.length > 0 ? (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {form.photos.map((url, i) => (
              <div
                key={`photo-${i}`}
                className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-zinc-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(url)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="rounded-[1.5rem] bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-900">Vidéos</h2>
          <button
            type="button"
            onClick={() => videoRef.current?.click()}
            disabled={videoLoading || form.videos.length >= 2}
            className="rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
          >
            + Ajouter
          </button>
          <input
            ref={videoRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              void onVideosSelected(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          Optionnel — max 2 vidéos, jusqu’à 10 min / 200 Mo.
        </p>
        {videoLoading && (
          <p className="mt-3 text-sm text-zinc-500">
            {videoProgress ?? "Traitement de la vidéo…"}
          </p>
        )}
        {form.videos.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {form.videos.map((ref) => (
              <VideoThumb
                key={ref}
                videoRef={ref}
                onRemove={() => void removeVideo(ref)}
              />
            ))}
          </div>
        )}
      </section>

      <div className="rounded-[1.5rem] bg-zinc-900 px-5 py-4 text-white">
        <p className="text-xs uppercase tracking-wide text-zinc-400">
          Loyer mensuel
        </p>
        <p className="mt-1 text-2xl font-bold tabular-nums">
          {formatFcfa(priceNum)}
        </p>
        <p className="mt-1 text-xs font-semibold text-emerald-400">
          Négociable sur toutes les annonces
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => submit("draft")}
          disabled={submitting}
          className="flex-1 rounded-full border border-[#ebebeb] bg-white py-3.5 text-sm font-semibold text-zinc-900 disabled:opacity-50"
        >
          {submitting ? "…" : "Sauvegarder comme brouillon"}
        </button>
        <button
          type="button"
          onClick={() => submit("active")}
          disabled={submitting}
          className="flex-1 rounded-full bg-zinc-900 py-3.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {submitting ? "Publication en cours…" : "Publier"}
        </button>
      </div>
    </div>
  );
}

function CountField({
  label,
  value,
  onChange,
  fieldClass,
  required,
  disabled,
  min = 0,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  fieldClass: string;
  required?: boolean;
  disabled?: boolean;
  min?: number;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
        {label}{" "}
        {required ? (
          <span className="text-red-500" aria-hidden>
            *
          </span>
        ) : null}
      </span>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        disabled={disabled}
        className={`${fieldClass} disabled:bg-zinc-50 disabled:text-zinc-400`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
      />
    </label>
  );
}

function VideoThumb({
  videoRef,
  onRemove,
}: {
  videoRef: string;
  onRemove: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let revoked: string | null = null;
    let cancelled = false;

    void resolveVideoUrl(videoRef).then((resolved) => {
      if (cancelled) {
        if (resolved?.startsWith("blob:")) URL.revokeObjectURL(resolved);
        return;
      }
      setUrl(resolved);
      if (resolved?.startsWith("blob:")) revoked = resolved;
    });

    return () => {
      cancelled = true;
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [videoRef]);

  return (
    <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-zinc-100">
      {url ? (
        <video
          src={url}
          className="h-full w-full object-cover"
          muted
          playsInline
          preload="metadata"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-xs text-zinc-400">
          …
        </div>
      )}
      <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white">
        Vidéo
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-xs text-white"
        aria-label="Supprimer la vidéo"
      >
        ✕
      </button>
    </div>
  );
}
