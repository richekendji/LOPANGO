import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Uniquement les pages publiques indexables.
 * - /app, /dashboard, /paiement, /admin → privés (robots disallow)
 * - /houses/[id] → public pour SEO, mais on n'ajoute que des annonces
 *   réelles quand elles seront en base (pas les seeds mock).
 * Mettre des URLs qui redirigent vers /login = « Page avec redirection »
 * dans Google Search Console.
 */
const STATIC_PATHS: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/login", changeFrequency: "monthly", priority: 0.5 },
  { path: "/register", changeFrequency: "monthly", priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return STATIC_PATHS.map((item) => ({
    url: item.path === "/" ? SITE_URL : `${SITE_URL}${item.path}`,
    lastModified: now,
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }));
}
