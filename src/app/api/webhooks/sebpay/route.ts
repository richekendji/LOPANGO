import { NextResponse, type NextRequest } from "next/server";
import { getSebPay } from "@/lib/sebpay";
import {
  activateSubscriptionForUser,
  parsePeriodFromExternalRef,
} from "@/lib/subscription";

const REF_RE =
  /^lopango_(mensuel|annuel)_([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})_/i;

/**
 * Webhook SebPay — confirmation serveur + activation abo en DB.
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
  } catch {
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

  const status = String(payload.status ?? "").toLowerCase();
  const approved =
    status === "approved" || status === "success" || status === "paid";
  const ref = payload.external_ref ?? "";
  const match = REF_RE.exec(ref);

  if (approved && match) {
    const userId = match[2];
    try {
      await activateSubscriptionForUser({
        userId,
        period: parsePeriodFromExternalRef(ref),
        transactionId: payload.transaction_id ?? ref,
        paymentMethod: "sebpay",
      });
    } catch {
      /* SebPay peut retenter */
    }
  }

  return NextResponse.json({ ok: true });
}
