import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createR2UploadUrl } from "@/lib/r2";
import { newId } from "@/lib/mock/houses";

export const runtime = "nodejs";

const MAX_BYTES = 200 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      contentType?: string;
      fileName?: string;
      size?: number;
    };

    const contentType = body.contentType || "video/mp4";
    if (!contentType.startsWith("video/")) {
      return NextResponse.json(
        { error: "Seuls les fichiers vidéo sont acceptés." },
        { status: 400 },
      );
    }
    if (typeof body.size === "number" && body.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Vidéo trop lourde (max 200 Mo)." },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const folder = user?.id ?? "guest";

    const extMatch = body.fileName?.match(/\.\w+$/);
    let ext = extMatch?.[0]?.toLowerCase() || ".mp4";
    if (contentType === "video/webm") ext = ".webm";
    if (contentType === "video/quicktime") ext = ".mov";

    const key = `videos/${folder}/${newId("vid")}${ext}`;
    const { uploadUrl, publicUrl } = await createR2UploadUrl({
      key,
      contentType,
    });

    return NextResponse.json({ ok: true, uploadUrl, publicUrl, key });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Impossible de préparer l’upload.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
