"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function submitContact(formData: FormData) {
  const houseId = String(formData.get("houseId") ?? "");
  const name = String(formData.get("name") ?? "");
  const phone = String(formData.get("phone") ?? "");
  const message = String(formData.get("message") ?? "");

  if (!houseId) {
    redirect("/houses");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/houses/${houseId}`);
  }

  // Récupère le propriétaire de la maison
  const { data: house } = await supabase
    .from("houses")
    .select("owner_id")
    .eq("id", houseId)
    .single();

  if (!house) {
    redirect(`/houses/${houseId}?error=house-not-found`);
  }

  const { error } = await supabase.from("contacts").insert({
    house_id: houseId,
    sender_id: user.id,
    receiver_id: house.owner_id,
    name,
    phone,
    message,
  });

  if (error) {
    redirect(`/houses/${houseId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/houses/${houseId}`);
  redirect(`/houses/${houseId}?sent=1`);
}