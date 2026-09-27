import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteDbHouse, getHouseFromDb, updateDbHouse, updateHouseStatus } from "@/lib/houses-db";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/admin";
import { maskHouseForPaywall } from "@/lib/mock/houses";
import type { SellerHouse } from "@/lib/mock/houses";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z.object({
  house: z
    .object({
      title: z.string().max(200),
      description: z.string().max(5000),
      price: z.number().int().min(0).max(100_000_000),
      phone: z.string().max(40),
      ownerName: z.string().max(120),
      showOwnerName: z.boolean(),
      city: z.string().max(80),
      neighborhood: z.string().max(120),
      street: z.string().max(200),
      avenue: z.string().max(200),
      reference: z.string().max(200),
      houseType: z.enum(["Villa", "Maison", "Appartement", "Studio"]),
      photos: z.array(z.string().max(2000)).max(20),
      videos: z.array(z.string().max(2000)).max(5),
      bedrooms: z.number().int().min(0).max(50),
      kitchens: z.number().int().min(0).max(50),
      livingRooms: z.number().int().min(0).max(50),
      showerInHouse: z.boolean(),
      showers: z.number().int().min(0).max(50),
      housesOnPlot: z.number().int().min(1).max(200),
      status: z.enum(["draft", "active", "hidden"]),
      contacts: z.number().int().min(0),
    })
    .optional(),
  status: z.enum(["draft", "active", "hidden"]).optional(),
});

async function requireUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const house = await getHouseFromDb(id);
    if (!house) {
      return NextResponse.json({ error: "Annonce introuvable." }, { status: 404 });
    }
    // Masquage paywall : jamais de phone/adresse dans une réponse publique.
    const safe = maskHouseForPaywall(house) as SellerHouse & {
      ownerId?: string | null;
    };
    delete safe.ownerId;
    return NextResponse.json({ ok: true, house: safe });
  } catch {
    return NextResponse.json(
      { error: "Impossible de charger l'annonce." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const userId = await requireUserId();
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides." },
        { status: 400 },
      );
    }

    // Admin : modification libre de toute annonce.
    if (await isAdminUser()) {
      const existing = await getHouseFromDb(id);
      if (!existing) {
        return NextResponse.json(
          { error: "Annonce introuvable." },
          { status: 404 },
        );
      }
      if (parsed.data.house) {
        const merged = { ...existing, ...parsed.data.house } as SellerHouse;
        const result = await updateDbHouse(id, merged, null);
        if (!result.ok) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }
      }
      if (parsed.data.status) {
        await updateHouseStatus(id, parsed.data.status, null);
      }
      return NextResponse.json({ ok: true });
    }

    if (parsed.data.house) {
      const house = { ...parsed.data.house, id } as unknown as SellerHouse;
      const result = await updateDbHouse(id, house, userId);
      if (!result.ok) {
        return NextResponse.json(
          { error: result.error },
          {
            status: result.error === "Non autorisé." ? 403 : 500,
          },
        );
      }
    }
    if (parsed.data.status) {
      const result = await updateHouseStatus(id, parsed.data.status, userId);
      if (!result.ok) {
        return NextResponse.json(
          { error: result.error },
          {
            status: result.error === "Non autorisé." ? 403 : 500,
          },
        );
      }
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Impossible de mettre à jour l'annonce." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const userId = await requireUserId();
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const house = await getHouseFromDb(id);
    if (!house) {
      return NextResponse.json({ error: "Annonce introuvable." }, { status: 404 });
    }
    if (house.ownerId !== userId && !(await isAdminUser())) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
    }

    const result = await deleteDbHouse(id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Impossible de supprimer l'annonce." },
      { status: 500 },
    );
  }
}