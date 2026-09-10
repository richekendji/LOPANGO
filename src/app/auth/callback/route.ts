import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/** Échange le code PKCE (lien email) contre une session, puis redirige. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/app";

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
