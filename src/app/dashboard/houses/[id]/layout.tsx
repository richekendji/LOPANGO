import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return pageMetadata({
    title: "Détail de l’annonce",
    description: "Aperçu et gestion de votre annonce LOPANGO.",
    path: `/dashboard/houses/${id}`,
  });
}

export default function DashboardHouseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
