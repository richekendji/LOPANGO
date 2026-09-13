import type { MetadataRoute } from "next";
import { SEED_HOUSES } from "@/lib/mock/houses";
import { SITE_URL } from "@/lib/seo";

// Uniquement les pages publiques. Les pages privées (/app, /dashboard,
// /paiement, /admin) sont exclues et bloquées via robots.ts.
const STATIC_PATHS: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] =
  [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/login", changeFrequency: "monthly", priority: 0.6 },
    { path: "/register", changeFrequency: "monthly", priority: 0.6 },
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

  return [...staticEntries, ...publicHouses];
}
