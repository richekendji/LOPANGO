import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/** Uniquement des chemins relatifs internes (anti open-redirect). */
function safeNextPath(raw: string | null): string {
  if (!raw) return "/app";
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("://")) {
    return "/app";
  }
  return raw.slice(0, 300);
}

/** Échange le code PKCE (lien email) contre une session, puis redirige. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  return NextResponse.redirect(
    new URL("/login?error=reset-link-invalid", origin),
  );
}
