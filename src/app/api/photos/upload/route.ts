import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getR2Client, getR2Bucket, getR2PublicBase } from "@/lib/r2";
import { newId } from "@/lib/mock/houses";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export const runtime = "nodejs";

const MAX_BYTES = 15 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

/** Upload coté serveur : le navigateur POSTe le fichier à Next.js,
  qui le transfère vers R2 sans aucun CORS/CSP côté navigateur. */
export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    const rl = await rateLimit(`upload-photo:${ip}`, {
      limit: 20,
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

    const form = await req.formData();
    const file = form.get("file");
    if (!file || typeof (file as any).arrayBuffer !== "function") {
      return NextResponse.json(
        { error: "Aucun fichier fourni." },
        { status: 400 },
      );
    }

    const buf = Buffer.from(await (file as File).arrayBuffer());
    const contentType = (file as File).type?.toLowerCase() || "image/jpeg";
    if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
      return NextResponse.json(
        { error: "Type de photo non accepté (jpeg, png, webp, gif)." },
        { status: 400 },
      );
    }
    if (buf.length > MAX_BYTES) {
      return NextResponse.json(
        { error: "Photo trop lourde (max 15 Mo)." },
        { status: 400 },
      );
    }

    const fileName = (file as File).name || `${newId("img")}.jpg`;
    const ext = fileName.match(/\.\w+$/)?.[0] ?? ".jpg";
    const key = `photos/${user.id}/${newId("img")}${ext}`;

    await getR2Client().send(
      new PutObjectCommand({
        Bucket: getR2Bucket(),
        Key: key,
        Body: buf,
        ContentType: contentType,
      }),
    );

    const publicUrl = `${getR2PublicBase()}/${key}`;
    return NextResponse.json({ ok: true, publicUrl });
  } catch (err) {
    console.error("[photos/upload] erreur:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Impossible de préparer l'upload." },
      { status: 500 },
    );
  }
}