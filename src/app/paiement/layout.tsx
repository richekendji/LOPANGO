import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Abonnement",
  description:
    "Débloquez LOPANGO par Mobile Money : 4 999 FCFA/mois ou 49 990 FCFA/an. Contacts et publication.",
  path: "/paiement",
});

export default function PaiementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
