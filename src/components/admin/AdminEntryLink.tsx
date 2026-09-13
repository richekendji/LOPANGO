import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminPhone } from "@/lib/admin";

export async function AdminEntryLink() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("phone")
    .eq("id", user.id)
    .maybeSingle();

  const metaPhone =
    typeof user.user_metadata?.phone === "string"
      ? user.user_metadata.phone
      : null;

  if (!isAdminPhone(profile?.phone) && !isAdminPhone(metaPhone)) {
    return null;
  }

  return (
    <Link
      href="/admin"
      className="mt-4 flex w-full items-center justify-center rounded-2xl bg-zinc-900 py-3 text-sm font-semibold text-white"
    >
      Ouvrir l’admin
    </Link>
  );
}
