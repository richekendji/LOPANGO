import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteR2Object, publicUrlToR2Key } from "@/lib/r2";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function DELETE(req: Request) {
  try {
    const ip = clientIp(req);
    const rl = rateLimit(`video-del:${ip}`, { limit: 30, windowMs: 60_000 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Trop de requêtes." },
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

    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url") || "";
    const key = publicUrlToR2Key(url);
    if (!key) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const prefix = `videos/${user.id}/`;
    if (!key.startsWith(prefix)) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
    }

    await deleteR2Object(key);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Suppression impossible." },
      { status: 500 },
    );
  }
}
