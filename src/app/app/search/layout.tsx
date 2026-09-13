import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Recherche",
  description:
    "Recherchez une maison à louer au Congo par quartier, type, prix et mots-clés.",
  path: "/app/search",
});

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
