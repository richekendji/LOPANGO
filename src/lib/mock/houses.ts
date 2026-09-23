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
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
];

function photos(...idxs: number[]) {
  return idxs.map((i) => SEED_PHOTOS[i % SEED_PHOTOS.length]);
}

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

/**
 * Version PAYWALL d'une annonce : téléphone + adresse réelle retirés
 * AVANT envoi au navigateur. Sans abonnement, les données sensibles ne
 * quittent jamais le serveur (le blur CSS seul était contournable via
 * les devtools). À utiliser pour tout rendu public non débloqué.
 */
export function maskHouseForPaywall(h: SellerHouse): SellerHouse {
  return {
    ...h,
    phone: "",
    street: "",
    avenue: "",
    reference: "",
    address: "",
    ownerName: "",
  };
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

/** Seed feed — annonces actives style Congo / Afrique, critères diversifiés. */
export const SEED_HOUSES: SellerHouse[] = [
  {
    id: "bzv-bacongo-villa-1",
    title: "",
    description:
      "Villa familiale avec grande cour, manguiers et parking pour 2 voitures. Quartier calme, proche école primaire.",
    price: 420000,
    phone: "+242 06 112 23 34",
    ownerName: "Amina Okemba",
    showOwnerName: true,
    city: "Brazzaville",
    neighborhood: "Bacongo",
    street: "Rue de la Paix",
    avenue: "Avenue de la Paix",
    reference: "Face à l’église Saint-Pierre",
    address: "",
    houseType: "Villa",
    photos: photos(0, 4, 8),
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
    updatedAt: "Il y a 1 h",
  },
  {
    id: "bzv-moungali-maison-2",
    title: "",
    description:
      "Maison en parpaing crépée, toit tôles neuves. Cour cimentée, puits + branchement SEEG. Idéal couple ou petite famille.",
    price: 185000,
    phone: "+242 05 223 34 45",
    ownerName: "Patrick Mabiala",
    showOwnerName: true,
    city: "Brazzaville",
    neighborhood: "Moungali",
    street: "Rue des Flamboyants",
    avenue: "Avenue de l’Indépendance",
    reference: "À côté du marché Moungali",
    address: "",
    houseType: "Maison",
    photos: photos(1, 5),
    videos: [],
    bedrooms: 2,
    kitchens: 1,
    livingRooms: 1,
    showerInHouse: false,
    showers: 1,
    housesOnPlot: 2,
    features: [],
    status: "active",
    contacts: 4,
    updatedAt: "Il y a 2 h",
  },
  {
    id: "bzv-poto-appart-3",
    title: "",
    description:
      "Appartement au 1er étage d’un immeuble local. Eau et courant stables, balcon sur rue commerçante.",
    price: 160000,
    phone: "+242 06 334 45 56",
    ownerName: "Grace Ndinga",
    showOwnerName: true,
    city: "Brazzaville",
    neighborhood: "Poto-Poto",
    street: "Rue Amilcar Cabral",
    avenue: "Avenue de la République",
    reference: "Près de la mosquée",
    address: "",
    houseType: "Appartement",
    photos: photos(15, 18),
    videos: [],
    bedrooms: 2,
    kitchens: 1,
    livingRooms: 1,
    showerInHouse: true,
    showers: 1,
    housesOnPlot: 1,
    features: [],
    status: "active",
    contacts: 3,
    updatedAt: "Il y a 3 h",
  },
  {
    id: "bzv-talangai-studio-4",
    title: "",
    description:
      "Studio meublé pour étudiant ou jeune travailleur. Cuisine coin, douche intérieure, wifi possible.",
    price: 75000,
    phone: "+242 05 445 56 67",
    ownerName: "Serge Louzolo",
    showOwnerName: false,
    city: "Brazzaville",
    neighborhood: "Talangaï",
    street: "Rue des Écoles",
    avenue: "Avenue Marien Ngouabi",
    reference: "Derrière le lycée",
    address: "",
    houseType: "Studio",
    photos: photos(16, 19),
    videos: [],
    bedrooms: 1,
    kitchens: 1,
    livingRooms: 0,
    showerInHouse: true,
    showers: 1,
    housesOnPlot: 3,
    features: [],
    status: "active",
    contacts: 9,
    updatedAt: "Il y a 4 h",
  },
  {
    id: "bzv-ouenze-maison-5",
    title: "",
    description:
      "Maison basse 3 chambres, salon spacieux, cuisine extérieure + douche dans la cour. Parcelle avec 2 logements.",
    price: 210000,
    phone: "+242 06 556 67 78",
    ownerName: "Claude Makaya",
    showOwnerName: true,
    city: "Brazzaville",
    neighborhood: "Ouenzé",
    street: "Rue Koulounda",
    avenue: "Avenue de Ouenzé",
    reference: "Près du carrefour Total",
    address: "",
    houseType: "Maison",
    photos: photos(2, 6, 10),
    videos: [],
    bedrooms: 3,
    kitchens: 1,
    livingRooms: 1,
    showerInHouse: false,
    showers: 1,
    housesOnPlot: 2,
    features: [],
    status: "active",
    contacts: 5,
    updatedAt: "Il y a 5 h",
  },
  {
    id: "bzv-makelekele-villa-6",
    title: "",
    description:
      "Villa standing, clôture haute, générateur + forage. Salon + salle à manger, cuisine équipée.",
    price: 650000,
    phone: "+242 05 667 78 89",
    ownerName: "Esther Bouanga",
    showOwnerName: true,
    city: "Brazzaville",
    neighborhood: "Makelekele",
    street: "Rue des Manguiers",
    avenue: "Avenue de la Victoire",
    reference: "Face au terrain de foot",
    address: "",
    houseType: "Villa",
    photos: photos(3, 7, 12),
    videos: [],
    bedrooms: 5,
    kitchens: 2,
    livingRooms: 2,
    showerInHouse: true,
    showers: 4,
    housesOnPlot: 1,
    features: [],
    status: "active",
    contacts: 2,
    updatedAt: "Il y a 6 h",
  },
  {
    id: "bzv-mfilou-maison-7",
    title: "",
    description:
      "Maison simple 2 chambres, cuisine fumée dehors, WC/douche dans la cour. Loyer accessible.",
    price: 95000,
    phone: "+242 06 778 89 90",
    ownerName: "Jean Massamba",
    showOwnerName: true,
    city: "Brazzaville",
    neighborhood: "Mfilou",
    street: "Rue Ngamakosso",
    avenue: "Avenue Mfilou",
    reference: "Après le pont, à gauche",
    address: "",
    houseType: "Maison",
    photos: photos(11, 1),
    videos: [],
    bedrooms: 2,
    kitchens: 1,
    livingRooms: 1,
    showerInHouse: false,
    showers: 1,
    housesOnPlot: 4,
    features: [],
    status: "active",
    contacts: 11,
    updatedAt: "Il y a 8 h",
  },
  {
    id: "bzv-plateau-appart-8",
    title: "",
    description:
      "Appartement moderne au Plateau, proche administrations. Climatisation salon, parking gardien.",
    price: 380000,
    phone: "+242 05 889 90 01",
    ownerName: "Nadia Mandzou",
    showOwnerName: true,
    city: "Brazzaville",
    neighborhood: "Plateau",
    street: "Rue du Commerce",
    avenue: "Avenue Amilcar Cabral",
    reference: "Derrière la BNP",
    address: "",
    houseType: "Appartement",
    photos: photos(13, 15, 18),
    videos: [],
    bedrooms: 3,
    kitchens: 1,
    livingRooms: 1,
    showerInHouse: true,
    showers: 2,
    housesOnPlot: 1,
    features: [],
    status: "active",
    contacts: 6,
    updatedAt: "Hier",
  },
  {
    id: "bzv-djiri-maison-9",
    title: "",
    description:
      "Maison neuve en périphérie, grand terrain, possibilité élevage ou jardin. Calme absolu.",
    price: 140000,
    phone: "+242 06 990 01 12",
    ownerName: "Bernard Ibara",
    showOwnerName: true,
    city: "Brazzaville",
    neighborhood: "Djiri",
    street: "Route de Djiri",
    avenue: "Avenue des Palmiers",
    reference: "Après le poste de police",
    address: "",
    houseType: "Maison",
    photos: photos(14, 0),
    videos: [],
    bedrooms: 3,
    kitchens: 1,
    livingRooms: 1,
    showerInHouse: true,
    showers: 1,
    housesOnPlot: 1,
    features: [],
    status: "active",
    contacts: 1,
    updatedAt: "Hier",
  },
  {
    id: "bzv-mpila-studio-10",
    title: "",
    description:
      "Studio indépendant dans une cour familiale. Entrée séparée, idéal célibataire.",
    price: 55000,
    phone: "+242 05 101 12 23",
    ownerName: "Chantal Tsiba",
    showOwnerName: false,
    city: "Brazzaville",
    neighborhood: "Mpila",
    street: "Rue des Cocotiers",
    avenue: "Avenue Mpila",
    reference: "Près de l’arrêt taxi",
    address: "",
    houseType: "Studio",
    photos: photos(17, 16),
    videos: [],
    bedrooms: 1,
    kitchens: 0,
    livingRooms: 0,
    showerInHouse: false,
    showers: 1,
    housesOnPlot: 5,
    features: [],
    status: "active",
    contacts: 8,
    updatedAt: "Hier",
  },
  {
    id: "pnr-loandjili-villa-11",
    title: "",
    description:
      "Villa à Loandjili, brise marine, grand salon, 2 salons + véranda. Clôture + portail électrique.",
    price: 580000,
    phone: "+242 06 212 23 34",
    ownerName: "Michel Ngoma",
    showOwnerName: true,
    city: "Pointe-Noire",
    neighborhood: "Loandjili",
    street: "Rue de la Côte",
    avenue: "Boulevard Lumumba",
    reference: "Vers la plage, 3e rue",
    address: "",
    houseType: "Villa",
    photos: photos(12, 3, 8),
    videos: [],
    bedrooms: 4,
    kitchens: 1,
    livingRooms: 3,
    showerInHouse: true,
    showers: 3,
    housesOnPlot: 1,
    features: [],
    status: "active",
    contacts: 4,
    updatedAt: "Il y a 2 h",
  },
  {
    id: "pnr-tie-tie-maison-12",
    title: "",
    description:
      "Maison populaire Tié-Tié, 3 chambres, cuisine et douche dans la maison. Proche marché.",
    price: 175000,
    phone: "+242 05 323 34 45",
    ownerName: "Rosalie Mavoungou",
    showOwnerName: true,
    city: "Pointe-Noire",
    neighborhood: "Tié-Tié",
    street: "Rue du Marché",
    avenue: "Avenue Tié-Tié",
    reference: "Face à la pharmacie",
    address: "",
    houseType: "Maison",
    photos: photos(5, 9),
    videos: [],
    bedrooms: 3,
    kitchens: 1,
    livingRooms: 1,
    showerInHouse: true,
    showers: 1,
    housesOnPlot: 1,
    features: [],
    status: "active",
    contacts: 7,
    updatedAt: "Il y a 3 h",
  },
  {
    id: "pnr-mpita-appart-13",
    title: "",
    description:
      "Appartement 2 pièces à Mpita, immeuble récent, eau courante, sécurité à l’entrée.",
    price: 220000,
    phone: "+242 06 434 45 56",
    ownerName: "Alain Kimbembé",
    showOwnerName: true,
    city: "Pointe-Noire",
    neighborhood: "Mpita",
    street: "Rue des Pêcheurs",
    avenue: "Avenue du Port",
    reference: "Près du rond-point",
    address: "",
    houseType: "Appartement",
    photos: photos(15, 19, 10),
    videos: [],
    bedrooms: 2,
    kitchens: 1,
    livingRooms: 1,
    showerInHouse: true,
    showers: 1,
    housesOnPlot: 1,
    features: [],
    status: "active",
    contacts: 3,
    updatedAt: "Il y a 5 h",
  },
  {
    id: "pnr-mongo-maison-14",
    title: "",
    description:
      "Maison 4 chambres Mongo-Mpoukou, parcelle avec 2 maisons. Une libre immédiatement.",
    price: 250000,
    phone: "+242 05 545 56 67",
    ownerName: "Florence Loubaki",
    showOwnerName: true,
    city: "Pointe-Noire",
    neighborhood: "Mongo-Mpoukou",
    street: "Rue des Écoles",
    avenue: "Avenue Mongo",
    reference: "Derrière l’église catholique",
    address: "",
    houseType: "Maison",
    photos: photos(6, 2, 11),
    videos: [],
    bedrooms: 4,
    kitchens: 1,
    livingRooms: 2,
    showerInHouse: true,
    showers: 2,
    housesOnPlot: 2,
    features: [],
    status: "active",
    contacts: 2,
    updatedAt: "Il y a 7 h",
  },
  {
    id: "pnr-cote-studio-15",
    title: "",
    description:
      "Studio meublé Côte sauvage, idéal intérimaire. Climatiseur, cuisine équipée minimale.",
    price: 110000,
    phone: "+242 06 656 67 78",
    ownerName: "Didier Moukala",
    showOwnerName: false,
    city: "Pointe-Noire",
    neighborhood: "Côte sauvage",
    street: "Rue de l’Océan",
    avenue: "Boulevard Atlantic",
    reference: "100 m de la plage",
    address: "",
    houseType: "Studio",
    photos: photos(16, 18),
    videos: [],
    bedrooms: 1,
    kitchens: 1,
    livingRooms: 0,
    showerInHouse: true,
    showers: 1,
    housesOnPlot: 1,
    features: [],
    status: "active",
    contacts: 5,
    updatedAt: "Hier",
  },
  {
    id: "pnr-lumumba-villa-16",
    title: "",
    description:
      "Grande villa quartier Lumumba, jardin tropical, 6 chambres, suite parentale, dépendances.",
    price: 780000,
    phone: "+242 05 767 78 89",
    ownerName: "Pauline Makaya",
    showOwnerName: true,
    city: "Pointe-Noire",
    neighborhood: "Lumumba",
    street: "Rue des Ambassades",
    avenue: "Avenue Lumumba",
    reference: "Près de la résidence",
    address: "",
    houseType: "Villa",
    photos: photos(7, 12, 0, 4),
    videos: [],
    bedrooms: 6,
    kitchens: 2,
    livingRooms: 3,
    showerInHouse: true,
    showers: 5,
    housesOnPlot: 1,
    features: [],
    status: "active",
    contacts: 1,
    updatedAt: "Il y a 1 j",
  },
  {
    id: "dol-centre-maison-17",
    title: "",
    description:
      "Maison 3 chambres à Dolisie centre, cour spacieuse, puits + SEEG. Calme, voisinage familial.",
    price: 120000,
    phone: "+242 06 878 89 90",
    ownerName: "Henri Tchikaya",
    showOwnerName: true,
    city: "Dolisie",
    neighborhood: "Centre-ville",
    street: "Rue du Marché",
    avenue: "Avenue de la Gare",
    reference: "Face à la mairie",
    address: "",
    houseType: "Maison",
    photos: photos(1, 14),
    videos: [],
    bedrooms: 3,
    kitchens: 1,
    livingRooms: 1,
    showerInHouse: false,
    showers: 1,
    housesOnPlot: 1,
    features: [],
    status: "active",
    contacts: 4,
    updatedAt: "Il y a 4 h",
  },
  {
    id: "nky-quartier-maison-18",
    title: "",
    description:
      "Maison 2 chambres à Nkayi, toiture récente, cuisine intérieure. Bon pour couple.",
    price: 85000,
    phone: "+242 05 989 90 01",
    ownerName: "Yvonne Bemba",
    showOwnerName: true,
    city: "Nkayi",
    neighborhood: "Quartier 5",
    street: "Rue Principale",
    avenue: "Avenue Nkayi",
    reference: "Près du stade",
    address: "",
    houseType: "Maison",
    photos: photos(9, 5),
    videos: [],
    bedrooms: 2,
    kitchens: 1,
    livingRooms: 1,
    showerInHouse: true,
    showers: 1,
    housesOnPlot: 2,
    features: [],
    status: "active",
    contacts: 2,
    updatedAt: "Il y a 6 h",
  },
  {
    id: "owa-centre-appart-19",
    title: "",
    description:
      "Appartement simple Owando, 1 chambre + salon. Proche services administratifs.",
    price: 70000,
    phone: "+242 06 090 01 12",
    ownerName: "Joseph Okouo",
    showOwnerName: true,
    city: "Owando",
    neighborhood: "Centre",
    street: "Rue de l’Hôpital",
    avenue: "Avenue Owando",
    reference: "À côté de la préfecture",
    address: "",
    houseType: "Appartement",
    photos: photos(17, 15),
    videos: [],
    bedrooms: 1,
    kitchens: 1,
    livingRooms: 1,
    showerInHouse: true,
    showers: 1,
    housesOnPlot: 1,
    features: [],
    status: "active",
    contacts: 3,
    updatedAt: "Il y a 9 h",
  },
  {
    id: "bzv-bacongo-appart-20",
    title: "",
    description:
      "F2 Bacongo, salon + chambre, cuisine américaine, douche moderne. Disponible de suite.",
    price: 145000,
    phone: "+242 05 191 12 23",
    ownerName: "Sandrine Mboungou",
    showOwnerName: true,
    city: "Brazzaville",
    neighborhood: "Bacongo",
    street: "Rue Matsoua",
    avenue: "Avenue de Bacongo",
    reference: "Derrière Total Bacongo",
    address: "",
    houseType: "Appartement",
    photos: photos(18, 8, 19),
    videos: [],
    bedrooms: 1,
    kitchens: 1,
    livingRooms: 1,
    showerInHouse: true,
    showers: 1,
    housesOnPlot: 1,
    features: [],
    status: "active",
    contacts: 6,
    updatedAt: "Il y a 30 min",
  },
  {
    id: "bzv-moungali-villa-21",
    title: "",
    description:
      "Villa duplex Moungali, 4 chambres, terrasse, garage. Standing pour famille nombreuse.",
    price: 520000,
    phone: "+242 06 292 23 34",
    ownerName: "Christian Nkouka",
    showOwnerName: true,
    city: "Brazzaville",
    neighborhood: "Moungali",
    street: "Rue des Palmiers",
    avenue: "Avenue des Trois Martyrs",
    reference: "Près du carrefour Moukondo",
    address: "",
    houseType: "Villa",
    photos: photos(13, 4, 7),
    videos: [],
    bedrooms: 4,
    kitchens: 1,
    livingRooms: 2,
    showerInHouse: true,
    showers: 3,
    housesOnPlot: 1,
    features: [],
    status: "active",
    contacts: 2,
    updatedAt: "Il y a 45 min",
  },
  {
    id: "pnr-loandjili-maison-22",
    title: "",
    description:
      "Maison 2 chambres Loandjili, douche hors maison, cuisine fumée. Budget serré OK.",
    price: 90000,
    phone: "+242 05 393 34 45",
    ownerName: "Thérèse Nianga",
    showOwnerName: true,
    city: "Pointe-Noire",
    neighborhood: "Loandjili",
    street: "Rue des Pêcheurs",
    avenue: "Avenue de la Plage",
    reference: "Avant le terrain de foot",
    address: "",
    houseType: "Maison",
    photos: photos(10, 1),
    videos: [],
    bedrooms: 2,
    kitchens: 1,
    livingRooms: 1,
    showerInHouse: false,
    showers: 1,
    housesOnPlot: 3,
    features: [],
    status: "active",
    contacts: 10,
    updatedAt: "Il y a 20 min",
  },
  // Brouillon / masquée — pour l’espace vendeur, hors feed
  {
    id: "draft-bzv-1",
    title: "",
    description: "Brouillon — appartement Poto-Poto en cours de photos.",
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
    photos: photos(2),
    videos: [],
    bedrooms: 2,
    kitchens: 1,
    livingRooms: 1,
    showerInHouse: true,
    showers: 1,
    housesOnPlot: 1,
    features: [],
    status: "draft",
    contacts: 0,
    updatedAt: "Hier",
  },
  {
    id: "hidden-pnr-1",
    title: "",
    description: "Villa masquée temporairement — Pointe-Noire.",
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
    photos: photos(3),
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
    message: "Bonjour, la villa Bacongo est-elle encore disponible ?",
    houseId: "bzv-bacongo-villa-1",
    createdAt: "Il y a 1 h",
  },
  {
    id: "c2",
    name: "Patrick Mabiala",
    phone: "+242 05 444 55 66",
    message: "Je souhaite visiter la maison Moungali ce week-end.",
    houseId: "bzv-moungali-maison-2",
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
