import { websiteJsonLd } from "@/lib/seo";

/** Schema.org WebSite — contenu statique, pas de saisie utilisateur. */
export function WebsiteJsonLd() {
  const json = JSON.stringify(websiteJsonLd());

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
