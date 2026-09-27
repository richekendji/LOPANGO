import { NextResponse } from "next/server";
import { z } from "zod";
import { insertHouse, listActiveHouses } from "@/lib/houses-db";
import { createClient } from "@/lib/supabase/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { isAdminUser } from "@/lib/admin";
import { getSessionSubscriptionActive } from "@/lib/subscription";
import { getCurrentAgent } from "@/lib/agents";
import { houseMatchesQuery } from "@/lib/search";
import {
  maskHouseForPaywall,
  type SellerHouse,
} from "@/lib/mock/houses";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const houseSchema = z.object({
  id: z.string().min(3).max(120),
  title: z.string().max(200),
  description: z.string().max(5000).default(""),
  price: z.number().int().min(0).max(100_000_000),
  phone: z.string().max(40),
  ownerName: z.string().max(120).default(""),
  showOwnerName: z.boolean().default(true),
  city: z.string().max(80),
  neighborhood: z.string().max(120),
  street: z.string().max(200).default(""),
  avenue: z.string().max(200).default(""),
  reference: z.string().max(200).default(""),
  houseType: z.enum(["Villa", "Maison", "Appartement", "Studio"]),
  photos: z.array(z.string().max(2000)).max(20).default([]),
  videos: z.array(z.string().max(2000)).max(5).default([]),
  bedrooms: z.number().int().min(0).max(50),
  kitchens: z.number().int().min(0).max(50),
  livingRooms: z.number().int().min(0).max(50),
  showerInHouse: z.boolean().default(true),
  showers: z.number().int().min(0).max(50),
  housesOnPlot: z.number().int().min(1).max(200),
  status: z.enum(["draft", "active", "hidden"]).default("active"),
  contacts: z.number().int().min(0).default(0),
});

/** Toutes les maisons actives — masquées paywall (jamais de phone/adresse).
 * Filtres serveur (sur données complètes) : q, neighborhood, houseType,
 * minPrice, maxPrice — la recherche par rue fonctionne, les réponses
 * restent masquées.
 */
export async function GET(req: Request) {
  try {
    const sp = new URL(req.url).searchParams;
    const q = sp.get("q")?.trim() ?? "";
    const neighborhood = sp.get("neighborhood") ?? "";
    const houseType = sp.get("houseType") ?? "";
    const min = sp.get("minPrice") ? Math.round(Number(sp.get("minPrice"))) : null;
    const max = sp.get("maxPrice") ? Math.round(Number(sp.get("maxPrice"))) : null;

    let houses = await listActiveHouses();
    if (neighborhood) {
      houses = houses.filter((h) => h.neighborhood === neighborhood);
    }
    if (houseType) {
      houses = houses.filter((h) => (h.houseType ?? "Maison") === houseType);
    }
    if (min !== null && !Number.isNaN(min)) {
      houses = houses.filter((h) => h.price >= min);
    }
    if (max !== null && !Number.isNaN(max)) {
      houses = houses.filter((h) => h.price <= max);
    }
    if (q) {
      houses = houses.filter((h) => houseMatchesQuery(h, q));
    }

    return NextResponse.json({ ok: true, houses: houses.map(maskHouseForPaywall) });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Impossible de charger les maisons." },
      { status: 500 },
    );
  }
}

/** Publie une maison : insérée en base, visible par tous.
 * Droit de publier vérifié SERVEUR (admin, abonnement actif ou démarcheur).
 */
export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    const rl = await rateLimit(`house-create:${ip}`, {
      limit: 20,
      windowMs: 60 * 60_000,
    });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Trop de publications. Réessaie plus tard." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const [admin, active, agent] = await Promise.all([
      isAdminUser(),
      getSessionSubscriptionActive(),
      getCurrentAgent(),
    ]);
    if (!admin && !active && !agent) {
      return NextResponse.json(
        { error: "Abonnement requis pour publier." },
        { status: 403 },
      );
    }

    const body = await req.json();
    const parsed = houseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données de l'annonce invalides." },
        { status: 400 },
      );
    }

    const house = parsed.data as unknown as SellerHouse;
    const result = await insertHouse(house, user.id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ ok: true, id: house.id });
  } catch {
    return NextResponse.json(
      { error: "Impossible de publier l'annonce." },
      { status: 500 },
    );
  }
}