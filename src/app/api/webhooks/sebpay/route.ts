import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { SUBSCRIPTION_DURATION_DAYS } from "@/lib/pricing";

/**
 * Webhook reçu de SebPay quand une transaction change de statut.
 * Vérifie la signature HMAC-SHA256 puis active la souscription.
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("X-SebPay-Signature");

  if (!signature) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  const secretKey = process.env.SEBPAY_SECRET_KEY;
  if (!secretKey) {
    console.error("SEBPAY_SECRET_KEY non configurée");
    return NextResponse.json({ error: "Config serveur" }, { status: 500 });
  }

  // Vérifie la signature HMAC-SHA256
  const expected = crypto
    .createHmac("sha256", secretKey)
    .update(body)
    .digest("hex");

  const received = signature.startsWith("sha256=")
    ? signature.slice(7)
    : signature;

  const ok =
    received.length === expected.length &&
    crypto.timingSafeEqual(
      Buffer.from(received, "hex"),
      Buffer.from(expected, "hex"),
    );

  if (!ok) {
    return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
  }

  let payload: {
    transaction_id?: string;
    external_ref?: string;
    status?: string;
  };
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const supabase = await createClient();

  // Cherche la souscription par sa transaction_id (external_ref)
  const ref = payload.external_ref ?? payload.transaction_id;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("transaction_id", ref)
    .maybeSingle();

  if (!subscription) {
    return NextResponse.json(
      { error: "Souscription introuvable" },
      { status: 404 },
    );
  }

  // Ne traite que les souscriptions en attente
  if (subscription.status !== "pending") {
    return NextResponse.json({ ok: true });
  }

  if (payload.status === "approved") {
    const startsAt = new Date();
    const expiresAt = new Date(
      startsAt.getTime() + SUBSCRIPTION_DURATION_DAYS * 24 * 60 * 60 * 1000,
    );

    await supabase
      .from("subscriptions")
      .update({
        status: "active",
        starts_at: startsAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        transaction_id: payload.transaction_id ?? ref,
      })
      .eq("id", subscription.id);

    // Met à jour le rôle du profil
    await supabase
      .from("profiles")
      .update({ role: subscription.role })
      .eq("id", subscription.user_id);
  } else if (payload.status === "rejected") {
    await supabase
      .from("subscriptions")
      .update({ status: "expired" })
      .eq("id", subscription.id);
  }

  return NextResponse.json({ ok: true });
}