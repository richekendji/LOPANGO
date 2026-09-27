import { NextResponse } from "next/server";
import { listHousesByOwner } from "@/lib/houses-db";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Les maisons de l'utilisateur connecté (tous statuts). */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }
    const houses = await listHousesByOwner(user.id);
    return NextResponse.json({ ok: true, houses });
  } catch {
    return NextResponse.json(
      { error: "Impossible de charger tes maisons." },
      { status: 500 },
    );
  }
}