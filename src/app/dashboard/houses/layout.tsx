import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Mes annonces",
  description: "Liste de vos maisons publiées sur LOPANGO.",
  path: "/dashboard/houses",
});

export default function DashboardHousesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
