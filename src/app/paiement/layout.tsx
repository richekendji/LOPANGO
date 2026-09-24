import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Abonnement",
  description:
    "Débloquez LOPANGO par Mobile Money : 3 999 FCFA/mois ou 39 990 FCFA/an. Contacts et publication.",
  path: "/paiement",
});

export default function PaiementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
