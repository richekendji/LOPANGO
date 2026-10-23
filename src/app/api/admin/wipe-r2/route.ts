import { NextResponse } from "next/server";
import { emptyR2Bucket, listAllR2Keys } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const k = new URL(req.url).searchParams.get("k");
  if (k !== "lopango-wipe-2026") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  try {
    const before = await listAllR2Keys();
    const deleted = await emptyR2Bucket();
    const after = await listAllR2Keys();
    return NextResponse.json({ ok: true, before: before.length, deleted, after: after.length });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
