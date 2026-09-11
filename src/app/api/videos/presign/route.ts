import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createR2UploadUrl } from "@/lib/r2";
import { newId } from "@/lib/mock/houses";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const MAX_BYTES = 200 * 1024 * 1024;

const bodySchema = z.object({
  contentType: z.string().min(1),
  fileName: z.string().max(255).optional(),
  size: z.number().int().positive().max(MAX_BYTES),
});

export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    const rl = rateLimit(`presign:${ip}`, { limit: 20, windowMs: 60_000 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Trop de requêtes. Réessaie plus tard." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Connexion requise pour envoyer une vidéo." },
        { status: 401 },
      );
    }

    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Paramètres d’upload invalides (type, taille)." },
        { status: 400 },
      );
    }

    const { contentType, fileName, size } = parsed.data;
    if (!contentType.startsWith("video/")) {
      return NextResponse.json(
        { error: "Seuls les fichiers vidéo sont acceptés." },
        { status: 400 },
      );
    }
    if (size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Vidéo trop lourde (max 200 Mo)." },
        { status: 400 },
      );
    }

    const extMatch = fileName?.match(/\.\w+$/);
    let ext = extMatch?.[0]?.toLowerCase() || ".mp4";
    if (contentType === "video/webm") ext = ".webm";
    if (contentType === "video/quicktime") ext = ".mov";

    const key = `videos/${user.id}/${newId("vid")}${ext}`;
    const { uploadUrl, publicUrl } = await createR2UploadUrl({
      key,
      contentType,
    });

    return NextResponse.json({ ok: true, uploadUrl, publicUrl, key });
  } catch {
    return NextResponse.json(
      { error: "Impossible de préparer l’upload." },
      { status: 500 },
    );
  }
}
