import { NextResponse } from "next/server";
import { priceForPeriod, type BillingPeriod, COUNTRY, CURRENCY } from "@/lib/pricing";
import { getSebPay, normalizeCongoPhone } from "@/lib/sebpay";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      phone?: string;
      operator?: string;
      period?: BillingPeriod;
      otpCode?: string;
      contexte?: string;
      retour?: string;
    };

    const phone = normalizeCongoPhone(body.phone ?? "");
    const operator = (body.operator ?? "").trim().toLowerCase();
    const period: BillingPeriod =
      body.period === "annuel" ? "annuel" : "mensuel";
    const otpCode = body.otpCode?.trim() || undefined;

    if (!phone || phone.length < 12) {
      return NextResponse.json(
        { error: "Numéro Mobile Money invalide." },
        { status: 400 },
      );
    }
    if (!operator) {
      return NextResponse.json(
        { error: "Choisissez un opérateur." },
        { status: 400 },
      );
    }

    const site =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      "http://localhost:3000";
    const amount = priceForPeriod(period);
    const externalRef = `lopango_${period}_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    const sebpay = getSebPay();
    const result = await sebpay.create({
      amount,
      currency: CURRENCY,
      phone,
      operator,
      country: COUNTRY,
      externalRef,
      callbackUrl: `${site}/api/webhooks/sebpay`,
      otpCode,
    });

    return NextResponse.json({
      ok: true,
      externalRef,
      transactionId: result.transaction_id ?? null,
      status: result.status ?? "pending",
      otpRequired: Boolean(result.otp_required),
      ussdCode: result.ussd_code ?? null,
      message: result.message ?? null,
      amount,
      period,
      contexte: body.contexte ?? "voir",
      retour: body.retour ?? "/app",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Échec de l’initiation du paiement.";
    console.error("[sebpay create]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
