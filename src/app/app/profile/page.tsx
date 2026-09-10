import { AuthAccountCard, ProfileSignOut } from "@/components/AuthAccountCard";
import { ProfileClient } from "./ProfileClient";

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
