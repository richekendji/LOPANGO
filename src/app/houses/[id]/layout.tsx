import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return pageMetadata({
    title: "Annonce",
    description:
      "Détails d’une maison à louer sur LOPANGO : composition, prix et contact propriétaire.",
    path: `/houses/${id}`,
  });
}

export default function HouseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
