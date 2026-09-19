import type { Metadata } from "next";
import { DashboardHomeClient } from "@/components/seller/DashboardHomeClient";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Espace vendeur",
  description:
    "Espace propriétaire LOPANGO : gérez vos annonces et les demandes des locataires.",
  path: "/dashboard",
});

export default function DashboardHome() {
  return <DashboardHomeClient />;
}
