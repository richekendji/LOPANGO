import { NextResponse, type NextRequest } from "next/server";
import { getSebPay } from "@/lib/sebpay";

/**
 * Webhook SebPay — confirmation serveur.
 * L’activation côté UI se fait aussi via polling /api/payments/status
 * (avant la base de données).
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("X-SebPay-Signature");

  if (!signature) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  try {
    const sebpay = getSebPay();
    if (!sebpay.verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
    }
  } catch (err) {
    console.error("[sebpay webhook config]", err);
    return NextResponse.json({ error: "Config serveur" }, { status: 500 });
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

  console.info("[sebpay webhook]", {
    status: payload.status,
    ref: payload.external_ref,
    tx: payload.transaction_id,
  });

  // Phase base : activer la souscription en DB ici.
  return NextResponse.json({ ok: true });
}
