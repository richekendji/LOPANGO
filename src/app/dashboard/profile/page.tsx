import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Profil vendeur",
  description: "Redirection vers votre profil LOPANGO.",
  path: "/dashboard/profile",
});

export default function DashboardProfileRedirect() {
  redirect("/app/profile");
}
