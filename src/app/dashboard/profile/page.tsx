import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "@/app/actions/auth";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string; error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-black text-zinc-900">Mon profil</h1>

      {params.updated && (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          Profil mis à jour !
        </div>
      )}
      {params.error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {params.error}
        </div>
      )}

      <form action={updateProfile} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Nom complet
          <input
            name="fullName"
            type="text"
            required
            defaultValue={profile?.full_name ?? ""}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Téléphone
          <input
            name="phone"
            type="tel"
            defaultValue={profile?.phone ?? ""}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none"
            placeholder="+242 06 000 00 00"
          />
        </label>

        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-600">
          <p className="font-medium">Email</p>
          <p className="mt-1">{user.email}</p>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-zinc-700">
            Mon rôle
          </legend>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm">
            <input
              type="radio"
              name="role"
              value="tenant"
              defaultChecked={profile?.role === "tenant"}
            />
            Locataire — je cherche une maison
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm">
            <input
              type="radio"
              name="role"
              value="owner"
              defaultChecked={profile?.role === "owner"}
            />
            Propriétaire — je loue ma maison
          </label>
        </fieldset>

        <button
          type="submit"
          className="rounded-xl bg-emerald-600 px-6 py-3 text-base font-semibold text-white hover:bg-emerald-500"
        >
          Enregistrer
        </button>
      </form>
    </div>
  );
}