import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Publier une maison",
  description:
    "Publiez une annonce LOPANGO : photos, vidéo, composition et prix en FCFA.",
  path: "/dashboard/houses/new",
});

export default function NewHouseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
