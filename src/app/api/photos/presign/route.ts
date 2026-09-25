import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createR2UploadUrl } from "@/lib/r2";
import { newId } from "@/lib/mock/houses";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const MAX_BYTES = 15 * 1024 * 1024;

/** Types MIME image acceptés. */
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const bodySchema = z.object({
  contentType: z.string().min(1),
  fileName: z.string().max(255).optional(),
  size: z.number().int().positive().max(MAX_BYTES),
});

export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    const rl = await rateLimit(`presign-photo:${ip}`, {
      limit: 40,
      windowMs: 60_000,
    });
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
        { error: "Connexion requise pour envoyer une photo." },
        { status: 401 },
      );
    }

    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Paramètres d'upload invalides (type, taille)." },
        { status: 400 },
      );
    }

    const { contentType, fileName, size } = parsed.data;
    if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
      return NextResponse.json(
        { error: "Type de photo non accepté (jpeg, png, webp, gif)." },
        { status: 400 },
      );
    }
    if (size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Photo trop lourde (max 15 Mo)." },
        { status: 400 },
      );
    }

    const extMatch = fileName?.match(/\.\w+$/);
    let ext = extMatch?.[0]?.toLowerCase() || ".jpg";
    if (contentType === "image/png") ext = ".png";
    else if (contentType === "image/webp") ext = ".webp";
    else if (contentType === "image/gif") ext = ".gif";

    const key = `photos/${user.id}/${newId("img")}${ext}`;
    const { uploadUrl, publicUrl } = await createR2UploadUrl({
      key,
      contentType,
    });

    return NextResponse.json({ ok: true, uploadUrl, publicUrl, key });
  } catch {
    return NextResponse.json(
      { error: "Impossible de préparer l'upload." },
      { status: 500 },
    );
  }
}