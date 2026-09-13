import type { MetadataRoute } from "next";
import { SEED_HOUSES } from "@/lib/mock/houses";
import { SITE_URL } from "@/lib/seo";

const STATIC_PATHS: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] =
  [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/login", changeFrequency: "monthly", priority: 0.6 },
    { path: "/register", changeFrequency: "monthly", priority: 0.6 },
    { path: "/forgot-password", changeFrequency: "yearly", priority: 0.3 },
    { path: "/reset-password", changeFrequency: "yearly", priority: 0.2 },
    { path: "/app", changeFrequency: "daily", priority: 0.9 },
    { path: "/app/search", changeFrequency: "daily", priority: 0.8 },
    { path: "/app/inbox", changeFrequency: "weekly", priority: 0.4 },
    { path: "/app/profile", changeFrequency: "monthly", priority: 0.4 },
    { path: "/app/saved", changeFrequency: "weekly", priority: 0.4 },
    { path: "/paiement", changeFrequency: "monthly", priority: 0.5 },
    { path: "/dashboard", changeFrequency: "weekly", priority: 0.5 },
    { path: "/dashboard/houses", changeFrequency: "weekly", priority: 0.5 },
    { path: "/dashboard/houses/new", changeFrequency: "monthly", priority: 0.4 },
    { path: "/dashboard/profile", changeFrequency: "monthly", priority: 0.3 },
  ];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((item) => ({
    url: item.path === "/" ? SITE_URL : `${SITE_URL}${item.path}`,
    lastModified: now,
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }));

  const publicHouses: MetadataRoute.Sitemap = SEED_HOUSES.filter(
    (h) => h.status === "active",
  ).map((h) => ({
    url: `${SITE_URL}/houses/${h.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const sellerHouses: MetadataRoute.Sitemap = SEED_HOUSES.flatMap((h) => [
    {
      url: `${SITE_URL}/dashboard/houses/${h.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/dashboard/houses/${h.id}/edit`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.2,
    },
  ]);

  return [...staticEntries, ...publicHouses, ...sellerHouses];
}
