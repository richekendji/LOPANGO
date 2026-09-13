import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Messages",
  description: "Vos messages et demandes de contact sur LOPANGO.",
  path: "/app/inbox",
});

export default function InboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
