"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  CITIES,
  HOUSE_TYPES,
  formatFcfa,
  newId,
  type HouseFeature,
  type HouseStatus,
  type HouseType,
  type SellerHouse,
} from "@/lib/mock/houses";
import {
  clearHouseFormDraft,
  getHouseFormDraft,
  getProfile,
  hasActiveSubscription,
  saveHouse,
  saveHouseFormDraft,
} from "@/lib/mock/store";
import { fileToPersistentUrl } from "@/lib/images";

type FormState = {
  title: string;
  description: string;
  price: string;
  phone: string;
  showOwnerName: boolean;
  city: string;
  neighborhood: string;
  address: string;
  houseType: HouseType;
  photos: string[];
  features: HouseFeature[];
};

function emptyForm(): FormState {
  return {
    title: "",
    description: "",
    price: "",
    phone: "+242 ",
    showOwnerName: true,
    city: "Brazzaville",
    neighborhood: "",
    address: "",
    houseType: "Maison",
    photos: [],
    features: [{ id: newId("f"), label: "", value: "" }],
  };
}

function fromHouse(h: SellerHouse): FormState {
  return {
    title: h.title,
    description: h.description,
    price: String(h.price),
    phone: h.phone,
    showOwnerName: h.showOwnerName ?? true,
    city: h.city,
    neighborhood: h.neighborhood,
    address: h.address,
    houseType: h.houseType ?? "Maison",
    photos: h.photos,
    features:
      h.features.length > 0
        ? h.features
        : [{ id: newId("f"), label: "", value: "" }],
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
  if (isValidDraft(draft)) {
    return {
      ...emptyForm(),
      ...draft,
      houseType: draft.houseType ?? "Maison",
      features:
        draft.features?.length > 0
          ? draft.features
          : [{ id: newId("f"), label: "", value: "" }],
      photos: draft.photos ?? [],
    };
  }
  return initial ? fromHouse(initial) : emptyForm();
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
  const errorRef = useRef<HTMLDivElement>(null);
  const draftId = houseId ?? initial?.id ?? null;
  const [form, setForm] = useState<FormState>(() =>
    loadInitialForm(initial, draftId),
  );
  const [error, setError] = useState<string | null>(null);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const priceNum = Math.round(Number(form.price) || 0);

  useEffect(() => {
    setForm(loadInitialForm(initial, draftId));
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId]);

  useEffect(() => {
    if (!ready) return;
    saveHouseFormDraft(form, draftId);
  }, [form, draftId, ready]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function addFeature() {
    update("features", [
      ...form.features,
      { id: newId("f"), label: "", value: "" },
    ]);
  }

  function removeFeature(id: string) {
    if (form.features.length <= 1) {
      showError("Au moins une caractéristique est obligatoire.");
      return;
    }
    update(
      "features",
      form.features.filter((f) => f.id !== id),
    );
  }

  function setFeature(id: string, patch: Partial<HouseFeature>) {
    update(
      "features",
      form.features.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    );
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

  function validate(): string | null {
    if (!form.title.trim()) return "Le titre est obligatoire.";
    if (!form.description.trim()) return "La description est obligatoire.";
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
    if (!form.address.trim()) return "L’adresse est obligatoire.";
    if (form.photos.length < 1) return "Ajoutez au moins une photo.";
    const featuresOk = form.features.filter(
      (f) => f.label.trim() && f.value.trim(),
    );
    if (featuresOk.length < 1) {
      return "Ajoutez au moins une caractéristique (ex. Chambre + nombre).";
    }
    const incomplete = form.features.some(
      (f) =>
        (f.label.trim() && !f.value.trim()) ||
        (!f.label.trim() && f.value.trim()),
    );
    if (incomplete) {
      return "Chaque caractéristique doit avoir un libellé et un nombre.";
    }
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
    setError(null);
    return {
      id: houseId ?? initial?.id ?? newId("house"),
      title: form.title.trim(),
      description: form.description.trim(),
      price: priceNum,
      phone: form.phone.trim(),
      ownerName,
      showOwnerName: form.showOwnerName,
      city: form.city,
      neighborhood: form.neighborhood.trim(),
      address: form.address.trim(),
      houseType: form.houseType,
      photos: form.photos,
      features: form.features.filter((f) => f.label.trim() && f.value.trim()),
      status,
      contacts: initial?.contacts ?? 0,
      updatedAt: "À l'instant",
    };
  }

  function submit(status: HouseStatus) {
    const house = buildHouse(status);
    if (!house) return;

    // Publier en ligne nécessite l’abonnement
    if (status === "active" && !hasActiveSubscription()) {
      saveHouseFormDraft(form, draftId);
      const retour = pathname || "/dashboard/houses/new";
      router.push(
        `/paiement?contexte=publier&retour=${encodeURIComponent(retour)}`,
      );
      return;
    }

    saveHouse(house);
    clearHouseFormDraft(draftId);
    if (!draftId) clearHouseFormDraft(null);
    router.push(`/dashboard/houses/${house.id}`);
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
          Titre {req}
        </span>
        <input
          className={field}
          required
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="Ex : Villa Bacongo 4 chambres"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Description {req}
        </span>
        <textarea
          className={`${field} min-h-28 resize-y`}
          required
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Décrivez la maison, le quartier, les équipements…"
        />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Prix mensuel (FCFA) {req}
          </span>
          <input
            type="number"
            min={1}
            step={1000}
            required
            className={field}
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
            placeholder="250000"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Téléphone {req}
          </span>
          <input
            type="tel"
            required
            className={field}
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="+242 06 000 00 00"
          />
        </label>
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#ebebeb] bg-white px-4 py-3.5">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-zinc-300"
          checked={form.showOwnerName}
          onChange={(e) => update("showOwnerName", e.target.checked)}
        />
        <span className="text-sm text-zinc-800">
          Afficher mon nom sur l’annonce
          <span className="mt-0.5 block text-xs text-zinc-500">
            Si décoché, seul le numéro du propriétaire sera visible.
          </span>
        </span>
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Ville {req}
        </span>
        <select
          className={field}
          required
          value={form.city}
          onChange={(e) => update("city", e.target.value)}
        >
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Type de maison {req}
        </span>
        <select
          className={field}
          required
          value={form.houseType}
          onChange={(e) => update("houseType", e.target.value as HouseType)}
        >
          {HOUSE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
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
            Adresse {req}
          </span>
          <input
            className={field}
            required
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="Rue, numéro…"
          />
        </label>
      </div>

      <section className="rounded-[1.5rem] bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-900">
            Photos {req}
          </h2>
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
                className="relative aspect-square overflow-hidden rounded-2xl bg-zinc-100"
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
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-zinc-900">
            Caractéristiques {req}
          </h2>
          <button
            type="button"
            onClick={addFeature}
            className="shrink-0 rounded-full border border-[#ebebeb] px-3 py-1.5 text-xs font-semibold text-zinc-800"
          >
            + Ajouter
          </button>
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          Écrivez le détail (chambre, cuisine…) puis le nombre à droite.
        </p>
        <div className="mt-3 space-y-2">
          {form.features.map((f) => (
            <div
              key={f.id}
              className="grid grid-cols-[minmax(0,1fr)_3.5rem_2rem] items-center gap-2"
            >
              <input
                type="text"
                required
                className="w-full min-w-0 rounded-2xl border border-[#ebebeb] bg-white px-3 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                placeholder="Chambre, Cuisine, Salon…"
                value={f.label}
                onChange={(e) => setFeature(f.id, { label: e.target.value })}
              />
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                className="w-full rounded-2xl border border-[#ebebeb] bg-white px-1 py-3 text-center text-sm tabular-nums text-zinc-900 outline-none focus:border-zinc-400"
                placeholder="0"
                value={f.value}
                onChange={(e) =>
                  setFeature(f.id, {
                    value: e.target.value.replace(/\D/g, ""),
                  })
                }
              />
              <button
                type="button"
                onClick={() => removeFeature(f.id)}
                className="flex h-10 w-8 items-center justify-center text-sm text-red-500"
                aria-label="Supprimer"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-[1.5rem] bg-zinc-900 px-5 py-4 text-white">
        <p className="text-xs uppercase tracking-wide text-zinc-400">
          Loyer mensuel
        </p>
        <p className="mt-1 text-2xl font-bold tabular-nums">
          {formatFcfa(priceNum)}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => submit("draft")}
          className="flex-1 rounded-full border border-[#ebebeb] bg-white py-3.5 text-sm font-semibold text-zinc-900"
        >
          Sauvegarder comme brouillon
        </button>
        <button
          type="button"
          onClick={() => submit("active")}
          className="flex-1 rounded-full bg-zinc-900 py-3.5 text-sm font-semibold text-white"
        >
          Publier
        </button>
      </div>
    </div>
  );
}
