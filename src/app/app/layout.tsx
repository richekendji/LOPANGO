import type { Metadata } from "next";
import { FeedShell } from "@/components/feed/FeedShell";
import { getCurrentAgent } from "@/lib/agents";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Accueil",
  description:
    "Feed LOPANGO : maisons à louer à Brazzaville, Pointe-Noire et partout au Congo. Vidéos, photos, contact direct.",
  path: "/app",
});

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Un démarcheur (liste blanche) voit « Retirer » à la place de
  // « Réclamation » et publie sans paywall.
  const agent = await getCurrentAgent();

  return <FeedShell isAgent={Boolean(agent)}>{children}</FeedShell>;
}
