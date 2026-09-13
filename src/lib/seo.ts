import type { Metadata } from "next";

export const SITE_NAME = "LOPANGO";
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.lopango.site"
);

export const DEFAULT_TITLE = "LOPANGO - Location de maisons au Congo";
export const DEFAULT_DESCRIPTION =
  "Trouvez ou louez votre maison au Congo. Contact direct propriétaire ↔ locataire, sans démarcheur. Brazzaville, Pointe-Noire et tout le pays.";

export const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: DEFAULT_TITLE,
} as const;

export function absoluteUrl(path = "/"): string {
  if (!path || path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle,
}: {
  title: string;
  description: string;
  path: string;
  /** Titre exact (sans template %s | LOPANGO). */
  absoluteTitle?: string;
}): Metadata {
  const url = absoluteUrl(path);
  const ogTitle = absoluteTitle ?? (title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`);

  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: ogTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: "fr_FR",
      type: "website",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [OG_IMAGE.url],
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    inLanguage: "fr",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/brand/logo.jpg`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/app/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
