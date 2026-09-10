export type HouseStatus = "draft" | "active" | "hidden";

export type HouseType = "Villa" | "Maison" | "Appartement" | "Studio";

export type HouseFeature = {
  id: string;
  label: string;
  value: string;
};

/** Libellés proposés dans le menu déroulant « Caractéristiques ». */
export const FEATURE_OPTIONS = [
  "Chambres",
  "Salons",
  "Cuisines",
  "Salles de bain",
  "Toilettes",
  "Parking",
  "Balcons",
  "Terrasses",
  "Autre",
] as const;

export type SellerHouse = {
  id: string;
  title: string;
  description: string;
  price: number;
  phone: string;
  ownerName: string;
  showOwnerName: boolean;
  city: string;
  neighborhood: string;
  address: string;
  houseType: HouseType;
  photos: string[];
  /** Réfs vidéo (`idb:video:…` ou URL). */
  videos: string[];
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

/** Seed vendeur — utilisé aussi pour le feed public (annonces active). */
export const SEED_HOUSES: SellerHouse[] = [
  {
    id: "1",
    title: "Villa Ubu Bacongo",
    description:
      "Belle villa moderne avec grand salon, cuisine équipée et cour sécurisée. Idéale famille.",
    price: 450000,
    phone: "+242 06 123 45 67",
    ownerName: "Jean Dupont",
    showOwnerName: true,
    city: "Brazzaville",
    neighborhood: "Bacongo",
    address: "Avenue de la Paix, Bacongo",
    houseType: "Villa",
    photos: [SEED_PHOTOS[0], SEED_PHOTOS[1], SEED_PHOTOS[2]],
    videos: [],
    features: [
      { id: "f1", label: "Chambres", value: "4" },
      { id: "f2", label: "Salons", value: "2" },
      { id: "f3", label: "Salles de bain", value: "3" },
    ],
    status: "active",
    contacts: 7,
    updatedAt: "Il y a 2 h",
  },
  {
    id: "2",
    title: "Maison moderne Moungali",
    description: "Maison lumineuse proche des commodités, parking inclus.",
    price: 280000,
    phone: "+242 05 987 65 43",
    ownerName: "Jean Dupont",
    showOwnerName: true,
    city: "Brazzaville",
    neighborhood: "Moungali",
    address: "Rue des Flamboyants, Moungali",
    houseType: "Maison",
    photos: [SEED_PHOTOS[1], SEED_PHOTOS[3]],
    videos: [],
    features: [
      { id: "f1", label: "Chambres", value: "3" },
      { id: "f2", label: "Salons", value: "1" },
      { id: "f3", label: "Cuisines", value: "1" },
    ],
    status: "active",
    contacts: 4,
    updatedAt: "Il y a 5 h",
  },
  {
    id: "3",
    title: "Résidence Poto-Poto",
    description: "Appartement spacieux en étage, eau et électricité stables.",
    price: 195000,
    phone: "+242 06 555 00 11",
    ownerName: "Jean Dupont",
    showOwnerName: true,
    city: "Brazzaville",
    neighborhood: "Poto-Poto",
    address: "Quartier Poto-Poto",
    houseType: "Appartement",
    photos: [SEED_PHOTOS[2]],
    videos: [],
    features: [
      { id: "f1", label: "Chambres", value: "2" },
      { id: "f2", label: "Cuisines", value: "1" },
    ],
    status: "draft",
    contacts: 1,
    updatedAt: "Hier",
  },
  {
    id: "4",
    title: "Villa Pointe-Noire centre",
    description: "Villa standing avec jardin et générateur.",
    price: 520000,
    phone: "+242 05 222 33 44",
    ownerName: "Jean Dupont",
    showOwnerName: true,
    city: "Pointe-Noire",
    neighborhood: "Centre-ville",
    address: "Boulevard du Général",
    houseType: "Villa",
    photos: [SEED_PHOTOS[3]],
    videos: [],
    features: [
      { id: "f1", label: "Chambres", value: "5" },
      { id: "f2", label: "Salons", value: "2" },
      { id: "f3", label: "Parking", value: "1" },
    ],
    status: "hidden",
    contacts: 0,
    updatedAt: "Il y a 3 j",
  },
];

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
  address: `${h.address}, ${h.city}`,
  price: h.price,
  image: h.photos[0] ?? SEED_PHOTOS[0],
}));

export function formatFcfa(n: number) {
  return `${Math.round(n).toLocaleString("fr-FR")} FCFA`;
}

export function newId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
