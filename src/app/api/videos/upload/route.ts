import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getR2Client, getR2Bucket, getR2PublicBase } from "@/lib/r2";
import { newId } from "@/lib/mock/houses";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export const runtime = "nodejs";

const MAX_BYTES = 200 * 1024 * 1024;

const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
  "video/mpeg",
]);

/** Upload coté serveur : le navigateur POSTe le fichier multipart/form-data
  à Next.js, qui le transfère vers R2 sans aucun CORS/CSP côté navigateur. */
export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    const rl = await rateLimit(`upload-video:${ip}`, {
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
        { error: "Connexion requise pour envoyer une vidéo." },
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
    const contentType = (file as File).type?.toLowerCase() || "video/mp4";
    if (!ALLOWED_VIDEO_TYPES.has(contentType)) {
      return NextResponse.json(
        { error: "Type de vidéo non accepté (mp4, webm, mov, m4v, mpg)." },
        { status: 400 },
      );
    }
    if (buf.length > MAX_BYTES) {
      return NextResponse.json(
        { error: "Vidéo trop lourde (max 200 Mo)." },
        { status: 400 },
      );
    }

    const fileName = (file as File).name || `${newId("vid")}.mp4`;
    const ext = fileName.match(/\.\w+$/)?.[0] ?? ".mp4";
    const key = `videos/${user.id}/${newId("vid")}${ext}`;

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
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[videos/upload] erreur:", msg);
    if (err instanceof Error && err.stack) console.error(err.stack);
    // DEBUG : on remonte le vrai message au client pour diagnostiquer.
    return NextResponse.json(
      { error: `Impossible de préparer l'upload. [${msg}]` },
      { status: 500 },
    );
  }
}
