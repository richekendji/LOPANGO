export type HouseStatus = "draft" | "active" | "hidden";

export type HouseType = "Villa" | "Maison" | "Appartement" | "Studio";

/** @deprecated Conservé pour anciennes annonces locales — préférer les champs structurés. */
export type HouseFeature = {
  id: string;
  label: string;
  value: string;
};

export type SellerHouse = {
  id: string;
  /** Généré automatiquement (type · chambres · quartier). */
  title: string;
  description: string;
  price: number;
  phone: string;
  ownerName: string;
  showOwnerName: boolean;
  city: string;
  neighborhood: string;
  /** Nom de la rue (débloqué après paiement). */
  street: string;
  /** Avenue (débloqué après paiement). */
  avenue: string;
  /** Point de repère / référence (débloqué après paiement). */
  reference: string;
  /** Résumé adresse (legacy + recherche) — composé à la sauvegarde. */
  address: string;
  houseType: HouseType;
  photos: string[];
  /** Réfs vidéo (`idb:video:…` ou URL). */
  videos: string[];
  bedrooms: number;
  kitchens: number;
  livingRooms: number;
  /** Douche / SDB à l’intérieur de la maison. */
  showerInHouse: boolean;
  showers: number;
  /** Nombre de maisons / logements dans la parcelle. */
  housesOnPlot: number;
  /** @deprecated Anciennes annonces — normalisé vers les champs ci-dessus. */
  features: HouseFeature[];
  status: HouseStatus;
  contacts: number;
  updatedAt: string;
};

export type ContactRequest = {
  id: string;
  name: string;
  phone: string;
  message: string;
  houseId: string;
  createdAt: string;
};

export const CITIES = [
  "Brazzaville",
  "Pointe-Noire",
  "Dolisie",
  "Nkayi",
  "Owando",
] as const;

export const HOUSE_TYPES: HouseType[] = [
  "Villa",
  "Maison",
  "Appartement",
  "Studio",
];

export const STATUS_LABEL: Record<
  HouseStatus,
  { label: string; className: string }
> = {
  draft: { label: "Brouillon", className: "bg-amber-50 text-amber-700" },
  active: { label: "En ligne", className: "bg-emerald-50 text-emerald-700" },
  hidden: { label: "Masquée", className: "bg-zinc-100 text-zinc-600" },
};

const SEED_PHOTOS = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
];

function pickFeatureCount(
  features: HouseFeature[] | undefined,
  ...needles: string[]
): number | undefined {
  if (!features?.length) return undefined;
  const hit = features.find((f) => {
    const label = f.label.toLowerCase();
    return needles.some((n) => label.includes(n));
  });
  if (!hit) return undefined;
  const n = Number(String(hit.value).replace(/\D/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

/** Complète / migre une annonce vers les champs structurés. */
export function normalizeHouse(h: SellerHouse): SellerHouse {
  const features = h.features ?? [];
  const raw = h as Partial<SellerHouse>;
  const bedrooms =
    typeof raw.bedrooms === "number"
      ? raw.bedrooms
      : (pickFeatureCount(features, "chambre") ?? 0);
  const kitchens =
    typeof raw.kitchens === "number"
      ? raw.kitchens
      : (pickFeatureCount(features, "cuisine") ?? 0);
  const livingRooms =
    typeof raw.livingRooms === "number"
      ? raw.livingRooms
      : (pickFeatureCount(features, "salon") ?? 0);
  const showers =
    typeof raw.showers === "number"
      ? raw.showers
      : (pickFeatureCount(features, "salle de bain", "douche", "sdb") ?? 0);
  const showerInHouse =
    typeof raw.showerInHouse === "boolean" ? raw.showerInHouse : showers > 0;
  const housesOnPlot =
    typeof raw.housesOnPlot === "number"
      ? raw.housesOnPlot
      : (pickFeatureCount(features, "parcelle", "maison dans") ?? 1);

  const street = (raw.street ?? "").trim();
  const avenue = (raw.avenue ?? "").trim();
  const reference = (raw.reference ?? "").trim();
  const address =
    (raw.address ?? "").trim() ||
    [street, avenue, reference].filter(Boolean).join(", ");

  const base = {
    ...h,
    houseType: h.houseType ?? ("Maison" as HouseType),
    ownerName: h.ownerName?.trim() || "Propriétaire",
    showOwnerName: h.showOwnerName ?? true,
    videos: h.videos ?? [],
    street,
    avenue,
    reference,
    address,
    bedrooms,
    kitchens,
    livingRooms,
    showerInHouse,
    showers,
    housesOnPlot,
    features: [] as HouseFeature[],
  };

  return {
    ...base,
    title: buildHouseTitle(base),
  };
}

/** Compose le champ address legacy à partir des détails. */
export function composeAddress(parts: {
  street?: string;
  avenue?: string;
  reference?: string;
  neighborhood?: string;
}): string {
  return [parts.street, parts.avenue, parts.reference, parts.neighborhood]
    .map((p) => (p ?? "").trim())
    .filter(Boolean)
    .join(", ");
}

/** Lignes affichées dans la zone floutée / débloquée. */
export function getLockedAddressRows(
  h: SellerHouse,
): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [
    { label: "Quartier", value: h.neighborhood?.trim() || "—" },
    { label: "Rue", value: h.street?.trim() || "—" },
    { label: "Avenue", value: h.avenue?.trim() || "—" },
    { label: "Référence", value: h.reference?.trim() || "—" },
  ];
  // Anciennes annonces : une seule ligne address si pas de détail
  if (!h.street?.trim() && !h.avenue?.trim() && !h.reference?.trim() && h.address?.trim()) {
    return [
      { label: "Quartier", value: h.neighborhood?.trim() || "—" },
      { label: "Adresse exacte", value: h.address.trim() },
    ];
  }
  return rows;
}

/** Titre affiché — généré depuis les critères (plus de saisie manuelle). */
export function buildHouseTitle(
  h: Pick<
    SellerHouse,
    "houseType" | "bedrooms" | "neighborhood" | "city"
  >,
): string {
  const type = h.houseType || "Maison";
  const rooms =
    h.bedrooms > 0
      ? `${h.bedrooms} chambre${h.bedrooms > 1 ? "s" : ""}`
      : null;
  const place = h.neighborhood?.trim() || h.city?.trim() || null;
  return [type, rooms, place].filter(Boolean).join(" · ");
}

export type HouseSpecRow = { label: string; value: string };

export function getHouseSpecRows(h: SellerHouse): HouseSpecRow[] {
  return [
    {
      label: "Chambres",
      value: String(h.bedrooms ?? 0),
    },
    {
      label: "Cuisines",
      value: String(h.kitchens ?? 0),
    },
    {
      label: "Salons",
      value: String(h.livingRooms ?? 0),
    },
    {
      label: "Douche dans la maison",
      value: h.showerInHouse ? "Oui" : "Non",
    },
    {
      label: "Douches",
      value: String(h.showers ?? 0),
    },
    {
      label: "Maisons dans la parcelle",
      value: String(h.housesOnPlot ?? 1),
    },
  ];
}

/** Résumé court pour listes / recherche. */
export function formatHouseSpecsShort(h: SellerHouse): string {
  const parts = [
    `${h.bedrooms ?? 0} ch.`,
    `${h.livingRooms ?? 0} salon${(h.livingRooms ?? 0) > 1 ? "s" : ""}`,
    `${h.kitchens ?? 0} cuis.`,
  ];
  if (h.showerInHouse) parts.push(`${h.showers ?? 0} douche${(h.showers ?? 0) > 1 ? "s" : ""}`);
  if ((h.housesOnPlot ?? 1) > 1) {
    parts.push(`${h.housesOnPlot} maisons / parcelle`);
  }
  return parts.join(" · ");
}

/** Seed vendeur — utilisé aussi pour le feed public (annonces active). */
export const SEED_HOUSES: SellerHouse[] = [
  {
    id: "1",
    title: "",
    description:
      "Belle villa moderne avec cour sécurisée. Idéale famille. Parking possible.",
    price: 450000,
    phone: "+242 06 123 45 67",
    ownerName: "Jean Dupont",
    showOwnerName: true,
    city: "Brazzaville",
    neighborhood: "Bacongo",
    street: "Rue de la Paix",
    avenue: "Avenue de la Paix",
    reference: "Face à l’église Saint-Pierre",
    address: "",
    houseType: "Villa",
    photos: [SEED_PHOTOS[0], SEED_PHOTOS[1], SEED_PHOTOS[2]],
    videos: [],
    bedrooms: 4,
    kitchens: 1,
    livingRooms: 2,
    showerInHouse: true,
    showers: 3,
    housesOnPlot: 1,
    features: [],
    status: "active",
    contacts: 7,
    updatedAt: "Il y a 2 h",
  },
  {
    id: "2",
    title: "",
    description: "Maison lumineuse proche des commodités, parking inclus.",
    price: 280000,
    phone: "+242 05 987 65 43",
    ownerName: "Jean Dupont",
    showOwnerName: true,
    city: "Brazzaville",
    neighborhood: "Moungali",
    street: "Rue des Flamboyants",
    avenue: "Avenue de l’Indépendance",
    reference: "À côté du marché Moungali",
    address: "",
    houseType: "Maison",
    photos: [SEED_PHOTOS[1], SEED_PHOTOS[3]],
    videos: [],
    bedrooms: 3,
    kitchens: 1,
    livingRooms: 1,
    showerInHouse: true,
    showers: 2,
    housesOnPlot: 1,
    features: [],
    status: "active",
    contacts: 4,
    updatedAt: "Il y a 5 h",
  },
  {
    id: "3",
    title: "",
    description: "Appartement spacieux en étage, eau et électricité stables.",
    price: 195000,
    phone: "+242 06 555 00 11",
    ownerName: "Jean Dupont",
    showOwnerName: true,
    city: "Brazzaville",
    neighborhood: "Poto-Poto",
    street: "Rue Amilcar Cabral",
    avenue: "",
    reference: "Près de la mosquée",
    address: "",
    houseType: "Appartement",
    photos: [SEED_PHOTOS[2]],
    videos: [],
    bedrooms: 2,
    kitchens: 1,
    livingRooms: 1,
    showerInHouse: true,
    showers: 1,
    housesOnPlot: 1,
    features: [],
    status: "draft",
    contacts: 1,
    updatedAt: "Hier",
  },
  {
    id: "4",
    title: "",
    description: "Villa standing avec jardin et générateur.",
    price: 520000,
    phone: "+242 05 222 33 44",
    ownerName: "Jean Dupont",
    showOwnerName: true,
    city: "Pointe-Noire",
    neighborhood: "Centre-ville",
    street: "Rue du Commerce",
    avenue: "Boulevard du Général",
    reference: "Derrière la mairie",
    address: "",
    houseType: "Villa",
    photos: [SEED_PHOTOS[3]],
    videos: [],
    bedrooms: 5,
    kitchens: 1,
    livingRooms: 2,
    showerInHouse: true,
    showers: 3,
    housesOnPlot: 1,
    features: [],
    status: "hidden",
    contacts: 0,
    updatedAt: "Il y a 3 j",
  },
].map((h) => normalizeHouse(h as SellerHouse));

export const SEED_CONTACTS: ContactRequest[] = [
  {
    id: "c1",
    name: "Amina Okemba",
    phone: "+242 06 111 22 33",
    message: "Bonjour, la villa est-elle encore disponible pour avril ?",
    houseId: "1",
    createdAt: "Il y a 1 h",
  },
  {
    id: "c2",
    name: "Patrick Mabiala",
    phone: "+242 05 444 55 66",
    message: "Je souhaite visiter la maison Moungali ce week-end.",
    houseId: "2",
    createdAt: "Il y a 3 h",
  },
];

/** Compatible feed public (active only). */
export type MockHouse = {
  id: string;
  title: string;
  address: string;
  price: number;
  image: string;
};

export const MOCK_HOUSES: MockHouse[] = SEED_HOUSES.filter(
  (h) => h.status === "active",
).map((h) => ({
  id: h.id,
  title: h.title,
  address: `${composeAddress(h) || h.address}, ${h.city}`,
  price: h.price,
  image: h.photos[0] ?? SEED_PHOTOS[0],
}));

export function formatFcfa(n: number) {
  return `${Math.round(n).toLocaleString("fr-FR")} FCFA`;
}

/** Loyer affiché partout — toujours négociable. */
export function formatRent(n: number) {
  return `${formatFcfa(n)} /mois · Négociable`;
}

export function newId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
