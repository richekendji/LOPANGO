import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeHouse, type SellerHouse } from "@/lib/mock/houses";

type HouseRow = {
  id: string;
  owner_id: string | null;
  title: string | null;
  description: string | null;
  price: number | null;
  city: string | null;
  neighborhood: string | null;
  street: string | null;
  avenue: string | null;
  reference: string | null;
  house_type: string | null;
  bedrooms: number | null;
  kitchens: number | null;
  living_rooms: number | null;
  shower_in_house: boolean | null;
  showers: number | null;
  houses_on_plot: number | null;
  owner_name: string | null;
  show_owner_name: boolean | null;
  contact_phone: string | null;
  status: string | null;
  videos: string[] | null;
  contacts: number | null;
  created_at: string;
};

type PhotoRow = { house_id: string; url: string; position: number | null };

function mapRow(row: HouseRow, photos: string[]): SellerHouse {
  return normalizeHouse({
    id: row.id,
    title: row.title ?? "",
    description: row.description ?? "",
    price: row.price ?? 0,
    phone: row.contact_phone ?? "",
    ownerName: row.owner_name ?? "",
    showOwnerName: row.show_owner_name ?? true,
    city: row.city ?? "",
    neighborhood: row.neighborhood ?? "",
    street: row.street ?? "",
    avenue: row.avenue ?? "",
    reference: row.reference ?? "",
    address: "",
    houseType: (row.house_type as SellerHouse["houseType"]) ?? "Maison",
    photos,
    videos: row.videos ?? [],
    bedrooms: row.bedrooms ?? 0,
    kitchens: row.kitchens ?? 0,
    livingRooms: row.living_rooms ?? 0,
    showerInHouse: row.shower_in_house ?? true,
    showers: row.showers ?? 0,
    housesOnPlot: row.houses_on_plot ?? 1,
    features: [],
    status: (row.status as SellerHouse["status"]) ?? "active",
    contacts: row.contacts ?? 0,
    updatedAt: row.created_at
      ? new Date(row.created_at).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
        })
      : "À l'instant",
  });
}

function toDbRow(h: SellerHouse, ownerId: string) {
  return {
    id: h.id,
    owner_id: ownerId,
    title: h.title,
    description: h.description,
    price: h.price,
    city: h.city,
    neighborhood: h.neighborhood,
    street: h.street,
    avenue: h.avenue,
    reference: h.reference,
    house_type: h.houseType,
    bedrooms: h.bedrooms,
    kitchens: h.kitchens,
    living_rooms: h.livingRooms,
    shower_in_house: h.showerInHouse,
    showers: h.showers,
    houses_on_plot: h.housesOnPlot,
    owner_name: h.ownerName,
    show_owner_name: h.showOwnerName,
    contact_phone: h.phone,
    status: h.status,
    videos: h.videos ?? [],
    contacts: h.contacts ?? 0,
  };
}

export async function listActiveHouses(): Promise<SellerHouse[]> {
  const admin = createAdminClient();
  const [{ data: rows }, { data: photos }] = await Promise.all([
    admin
      .from("houses")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false }),
    admin
      .from("house_photos")
      .select("house_id, url, position")
      .order("position", { ascending: true }),
  ]);

  const byHouse = new Map<string, string[]>();
  for (const p of (photos ?? []) as PhotoRow[]) {
    const list = byHouse.get(p.house_id) ?? [];
    list.push(p.url);
    byHouse.set(p.house_id, list);
  }

  return ((rows ?? []) as HouseRow[]).map((r) =>
    mapRow(r, byHouse.get(r.id) ?? []),
  );
}

export async function listHousesByOwner(
  ownerId: string,
): Promise<SellerHouse[]> {
  const admin = createAdminClient();
  const [{ data: rows }, { data: photos }] = await Promise.all([
    admin
      .from("houses")
      .select("*")
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false }),
    admin
      .from("house_photos")
      .select("house_id, url, position")
      .order("position", { ascending: true }),
  ]);

  const byHouse = new Map<string, string[]>();
  for (const p of (photos ?? []) as PhotoRow[]) {
    const list = byHouse.get(p.house_id) ?? [];
    list.push(p.url);
    byHouse.set(p.house_id, list);
  }

  return ((rows ?? []) as HouseRow[]).map((r) =>
    mapRow(r, byHouse.get(r.id) ?? []),
  );
}

export async function getHouseFromDb(
  id: string,
): Promise<(SellerHouse & { ownerId: string | null }) | null> {
  const admin = createAdminClient();
  const { data: row } = await admin
    .from("houses")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!row) return null;

  const { data: photos } = await admin
    .from("house_photos")
    .select("house_id, url, position")
    .eq("house_id", id)
    .order("position", { ascending: true });

  return {
    ...mapRow(
      row as HouseRow,
      ((photos ?? []) as PhotoRow[]).map((p) => p.url),
    ),
    ownerId: (row as HouseRow).owner_id ?? null,
  };
}

export async function insertHouse(
  house: SellerHouse,
  ownerId: string,
): Promise<{ ok: boolean; error?: string }> {
  const admin = createAdminClient();
  const { error } = await admin.from("houses").insert(toDbRow(house, ownerId));
  if (error) {
    console.error("[houses-db] insert error:", error.message);
    return { ok: false, error: "Erreur d'enregistrement de l'annonce." };
  }
  const photoRows = (house.photos ?? []).map((url, i) => ({
    house_id: house.id,
    url,
    position: i,
  }));
  if (photoRows.length) {
    const { error: photoError } = await admin
      .from("house_photos")
      .insert(photoRows);
    if (photoError) {
      console.error("[houses-db] photos insert error:", photoError.message);
    }
  }
  return { ok: true };
}

export async function updateDbHouse(
  id: string,
  house: SellerHouse,
  ownerId: string | null,
): Promise<{ ok: boolean; error?: string }> {
  const admin = createAdminClient();
  // Vérifie l'existence et la propriété AVANT toute écriture.
  const { data: existing } = await admin
    .from("houses")
    .select("owner_id")
    .eq("id", id)
    .maybeSingle();
  if (!existing) {
    return { ok: false, error: "Annonce introuvable." };
  }
  if (ownerId && (existing as { owner_id: string | null }).owner_id !== ownerId) {
    return { ok: false, error: "Non autorisé." };
  }

  // ownerId null = admin : owner_id jamais écrasé.
  const update = toDbRow(house, (existing as { owner_id: string | null }).owner_id ?? "");
  delete (update as Record<string, unknown>).owner_id;

  const { error } = await admin.from("houses").update(update).eq("id", id);
  if (error) {
    console.error("[houses-db] update error:", error.message);
    return { ok: false, error: "Erreur de mise à jour de l'annonce." };
  }
  const { error: delError } = await admin
    .from("house_photos")
    .delete()
    .eq("house_id", id);
  if (delError) {
    console.error("[houses-db] photos reset error:", delError.message);
  }
  const photoRows = (house.photos ?? []).map((url, i) => ({
    house_id: id,
    url,
    position: i,
  }));
  if (photoRows.length) {
    const { error: photoError } = await admin
      .from("house_photos")
      .insert(photoRows);
    if (photoError) {
      console.error("[houses-db] photos insert error:", photoError.message);
    }
  }
  return { ok: true };
}

export async function updateHouseStatus(
  id: string,
  status: SellerHouse["status"],
  ownerId: string | null,
): Promise<{ ok: boolean; error?: string }> {
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("houses")
    .select("owner_id")
    .eq("id", id)
    .maybeSingle();
  if (!existing) {
    return { ok: false, error: "Annonce introuvable." };
  }
  if (ownerId && (existing as { owner_id: string | null }).owner_id !== ownerId) {
    return { ok: false, error: "Non autorisé." };
  }
  const { error } = await admin.from("houses").update({ status }).eq("id", id);
  if (error) {
    console.error("[houses-db] status error:", error.message);
    return { ok: false, error: "Erreur de mise à jour du statut." };
  }
  return { ok: true };
}

export async function deleteDbHouse(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const admin = createAdminClient();
  const { error } = await admin.from("houses").delete().eq("id", id);
  if (error) {
    console.error("[houses-db] delete error:", error.message);
    return { ok: false, error: "Erreur de suppression." };
  }
  return { ok: true };
}