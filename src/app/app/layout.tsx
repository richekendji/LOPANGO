import type { Metadata } from "next";
import { FeedShell } from "@/components/feed/FeedShell";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Accueil",
  description:
    "Feed LOPANGO : maisons à louer à Brazzaville, Pointe-Noire et partout au Congo. Vidéos, photos, contact direct.",
  path: "/app",
});

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <FeedShell>{children}</FeedShell>;
}
