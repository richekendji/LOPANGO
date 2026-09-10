import { NextResponse } from "next/server";
import { deleteR2Object, publicUrlToR2Key } from "@/lib/r2";

export const runtime = "nodejs";

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url") || "";
    const key = publicUrlToR2Key(url);
    if (!key) {
      return NextResponse.json({ ok: true, skipped: true });
    }
    await deleteR2Object(key);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Suppression impossible.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
