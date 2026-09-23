import type { Metadata } from "next";
import { AuthAccountCard, ProfileSignOut } from "@/components/AuthAccountCard";
import { RecoveryEmailCard } from "@/components/RecoveryEmailCard";
import { AdminEntryLink } from "@/components/admin/AdminEntryLink";
import { ProfileClient } from "./ProfileClient";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Profil",
  description: "Gérez votre profil LOPANGO : coordonnées, ville et rôle.",
  path: "/app/profile",
});

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="px-4 pb-6">
      <h1 className="text-lg font-bold text-zinc-900">Profil</h1>
      <p className="mt-1 text-sm text-zinc-500">Vos informations LOPANGO</p>
      <AuthAccountCard />
      <RecoveryEmailCard saved={params.saved} error={params.error} />
      <ProfileClient />
      <AdminEntryLink />
      <ProfileSignOut />
    </div>
  );
}
