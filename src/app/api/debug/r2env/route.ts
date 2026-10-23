import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getR2Client, getR2Bucket, getR2PublicBase } from "@/lib/r2";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Nettoie une valeur d'env comme requireEnv (guillemets + espaces). */
function clean(raw: string | undefined): string {
  let v = (raw ?? "").trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1).trim();
  }
  return v;
}

function hostOf(url: string | undefined): string {
  try {
    return new URL(clean(url)).host;
  } catch {
    return "(invalide)";
  }
}

export async function GET(req: Request) {
  const k = new URL(req.url).searchParams.get("k");
  if (k !== "lopango-debug-2026") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const ak = clean(process.env.R2_ACCESS_KEY_ID);
  const sk = clean(process.env.R2_SECRET_ACCESS_KEY);

  const out: Record<string, unknown> = {
    supabase: {
      urlHost: hostOf(process.env.NEXT_PUBLIC_SUPABASE_URL),
      anonLen: clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).length,
      serviceRoleLen: clean(process.env.SUPABASE_SERVICE_ROLE_KEY).length,
    },
    r2: {
      akLen: ak.length,
      akStart: ak.slice(0, 4),
      akEnd: ak.slice(-4),
      skLen: sk.length,
      endpointHost: hostOf(process.env.R2_ENDPOINT),
      bucket: getR2Bucket(),
      publicHost: hostOf(process.env.NEXT_PUBLIC_R2_PUBLIC_URL),
    },
  };

  // Test Supabase (service_role) : lecture de la table houses.
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from("houses").select("id").limit(1);
    out.supabaseTest = error
      ? { ok: false, error: error.message }
      : { ok: true, rows: data?.length ?? 0 };
  } catch (e) {
    out.supabaseTest = { ok: false, error: e instanceof Error ? e.message : String(e) };
  }

  // Test R2 : petit PUT d'un objet de diagnostic.
  try {
    const key = `debug/probe-${Date.now()}.txt`;
    await getR2Client().send(
      new PutObjectCommand({
        Bucket: getR2Bucket(),
        Key: key,
        Body: Buffer.from("probe"),
        ContentType: "text/plain",
      }),
    );
    out.r2Test = { ok: true, publicUrl: `${getR2PublicBase()}/${key}` };
  } catch (e) {
    const err = e as { name?: string; message?: string; Code?: string; $metadata?: { httpStatusCode?: number } };
    out.r2Test = {
      ok: false,
      name: err?.name,
      code: err?.Code,
      status: err?.$metadata?.httpStatusCode,
      error: err?.message ?? String(e),
    };
  }

  return NextResponse.json(out);
}
