import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Réclamations",
  description: "Fais ta réclamation auprès de l'équipe LOPANGO.",
  path: "/app/inbox",
});

export default function InboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
