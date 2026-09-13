import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return pageMetadata({
    title: "Modifier l’annonce",
    description: "Modifiez les informations de votre maison sur LOPANGO.",
    path: `/dashboard/houses/${id}/edit`,
  });
}

export default function EditHouseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
