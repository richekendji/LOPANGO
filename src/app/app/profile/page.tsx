import type { Metadata } from "next";
import { AuthAccountCard, ProfileSignOut } from "@/components/AuthAccountCard";
import { ProfileClient } from "./ProfileClient";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Profil",
  description: "Gérez votre profil LOPANGO : coordonnées, ville et rôle.",
  path: "/app/profile",
});

export default function ProfilePage() {
  return (
    <div className="px-4 pb-6">
      <h1 className="text-lg font-bold text-zinc-900">Profil</h1>
      <p className="mt-1 text-sm text-zinc-500">Vos informations LOPANGO</p>
      <AuthAccountCard />
      <ProfileClient />
      <ProfileSignOut />
    </div>
  );
}
