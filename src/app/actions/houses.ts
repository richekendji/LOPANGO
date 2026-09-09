"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createHouse(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const title = String(formData.get("title") ?? "");
  const description = String(formData.get("description") ?? "");
  const price = Number(formData.get("price") ?? 0);
  const city = String(formData.get("city") ?? "");
  const neighborhood = String(formData.get("neighborhood") ?? "");
  const address = String(formData.get("address") ?? "");
  const contactPhone = String(formData.get("contactPhone") ?? "");

  if (!title || !price || price <= 0) {
    redirect("/dashboard/houses/new?error=missing-fields");
  }

  const { error } = await supabase
    .from("houses")
    .insert({
      owner_id: user.id,
      title,
      description,
      price,
      city,
      neighborhood,
      address,
      contact_phone: contactPhone,
      status: "active",
    })
    .select("id")
    .single();

  if (error) {
    redirect(`/dashboard/houses/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/houses");
  redirect("/dashboard/houses");
}

export async function updateHouse(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "");
  const description = String(formData.get("description") ?? "");
  const price = Number(formData.get("price") ?? 0);
  const city = String(formData.get("city") ?? "");
  const neighborhood = String(formData.get("neighborhood") ?? "");
  const address = String(formData.get("address") ?? "");
  const contactPhone = String(formData.get("contactPhone") ?? "");
  const status = String(formData.get("status") ?? "active");

  if (!id) {
    redirect("/dashboard/houses");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("houses")
    .update({
      title,
      description,
      price,
      city,
      neighborhood,
      address,
      contact_phone: contactPhone,
      status,
    })
    .eq("id", id);

  if (error) {
    redirect(`/dashboard/houses/${id}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/houses");
  redirect("/dashboard/houses");
}

export async function deleteHouse(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) {
    redirect("/dashboard/houses");
  }

  const supabase = await createClient();
  await supabase.from("houses").delete().eq("id", id);

  revalidatePath("/dashboard/houses");
  redirect("/dashboard/houses");
}

export async function toggleHouseStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "active");

  const supabase = await createClient();
  await supabase
    .from("houses")
    .update({ status: status === "active" ? "inactive" : "active" })
    .eq("id", id);

  revalidatePath("/dashboard/houses");
}