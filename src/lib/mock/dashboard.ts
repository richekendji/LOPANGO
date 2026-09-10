export type DashboardStat = {
  id: string;
  label: string;
  value: string;
  delta: string;
  positive: boolean;
};

export type RecentListing = {
  id: string;
  title: string;
  city: string;
  price: number;
  status: "active" | "hidden" | "pending";
  contacts: number;
  updatedAt: string;
};

export const DASHBOARD_STATS: DashboardStat[] = [
  {
    id: "active",
    label: "Annonces actives",
    value: "12",
    delta: "+2 cette semaine",
    positive: true,
  },
  {
    id: "messages",
    label: "Messages reçus",
    value: "34",
    delta: "+8 cette semaine",
    positive: true,
  },
  {
    id: "views",
    label: "Vues du catalogue",
    value: "1 248",
    delta: "+12% vs mois dernier",
    positive: true,
  },
  {
    id: "contacts",
    label: "Demandes contact",
    value: "19",
    delta: "3 en attente",
    positive: false,
  },
];

export const RECENT_LISTINGS: RecentListing[] = [
  {
    id: "1",
    title: "Villa Ubu Bacongo",
    city: "Brazzaville — Bacongo",
    price: 450000,
    status: "active",
    contacts: 7,
    updatedAt: "Il y a 2 h",
  },
  {
    id: "2",
    title: "Appartement Moungali 3 pièces",
    city: "Brazzaville — Moungali",
    price: 185000,
    status: "active",
    contacts: 4,
    updatedAt: "Il y a 5 h",
  },
  {
    id: "3",
    title: "Maison Poto-Poto avec cour",
    city: "Brazzaville — Poto-Poto",
    price: 220000,
    status: "pending",
    contacts: 1,
    updatedAt: "Hier",
  },
  {
    id: "4",
    title: "Studio Ouenzé centre",
    city: "Brazzaville — Ouenzé",
    price: 95000,
    status: "hidden",
    contacts: 0,
    updatedAt: "Il y a 3 j",
  },
  {
    id: "5",
    title: "Duplex Pointe-Noire centre",
    city: "Pointe-Noire — Centre-ville",
    price: 380000,
    status: "active",
    contacts: 11,
    updatedAt: "Il y a 4 j",
  },
];

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "grid" },
  { href: "/app", label: "Accueil", icon: "home" },
  { href: "/app/search", label: "Recherche", icon: "search" },
  { href: "/app/saved", label: "Favoris", icon: "heart" },
  { href: "/app/inbox", label: "Messages", icon: "inbox" },
  { href: "/dashboard/houses", label: "Mes maisons", icon: "building" },
  { href: "/dashboard/profile", label: "Profil", icon: "user" },
] as const;
