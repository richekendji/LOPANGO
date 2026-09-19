import { NextResponse } from "next/server";
import { z } from "zod";
import {
  priceForPeriod,
  type BillingPeriod,
  COUNTRY,
  CURRENCY,
  CONGO_OPERATORS,
} from "@/lib/pricing";
import { getSebPay, normalizeCongoPhone } from "@/lib/sebpay";
import { createClient } from "@/lib/supabase/server";
import { activateSubscriptionForUser } from "@/lib/subscription";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { recordPaymentIntent } from "@/lib/agents";

const operatorSlugs = CONGO_OPERATORS.map((o) => o.slug) as [string, ...string[]];

const bodySchema = z.object({
  phone: z.string().min(1),
  operator: z.enum(operatorSlugs),
  period: z.enum(["mensuel", "annuel"]).default("mensuel"),
  otpCode: z.string().max(20).optional(),
  contexte: z.string().max(40).optional(),
  retour: z.string().max(300).optional(),
  houseId: z.string().max(80).optional(),
});

function safeRetour(raw: string | undefined): string {
  if (!raw) return "/app";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/app";
  return raw.slice(0, 300);
}

export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    const rl = await rateLimit(`pay-create:${ip}`, { limit: 8, windowMs: 60_000 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Trop de tentatives de paiement." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Connecte-toi pour payer." },
        { status: 401 },
      );
    }

    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données de paiement invalides." },
        { status: 400 },
      );
    }

    const phone = normalizeCongoPhone(parsed.data.phone);
    if (!phone || phone.length < 12) {
      return NextResponse.json(
        { error: "Numéro Mobile Money invalide." },
        { status: 400 },
      );
    }

    const period: BillingPeriod = parsed.data.period;
    const operator = parsed.data.operator;
    const otpCode = parsed.data.otpCode?.trim() || undefined;
    const retour = safeRetour(parsed.data.retour);
    const contexte = parsed.data.contexte === "publier" ? "publier" : "voir";

    // Dev local : active l’abo sans SebPay (toujours lié à la session).
    if (process.env.NODE_ENV === "development") {
      await activateSubscriptionForUser({
        userId: user.id,
        period,
        transactionId: `dev_${Date.now()}`,
        paymentMethod: "dev",
      });
      return NextResponse.json({
        ok: true,
        approved: true,
        activated: true,
        externalRef: `dev_${period}_${user.id.slice(0, 8)}`,
        transactionId: null,
        status: "approved",
        amount: priceForPeriod(period),
        period,
        contexte,
        retour,
      });
    }

    const site =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      "http://localhost:3000";
    const amount = priceForPeriod(period);
    const externalRef = `lopango_${period}_${user.id}_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    // Mémorise l'annonce d'origine du paiement pour l'attribution
    // de la commission agent au webhook (1ʳᵉ conversion = 4 500 FCFA).
    await recordPaymentIntent({
      externalRef,
      userId: user.id,
      houseId: parsed.data.houseId ?? null,
    });

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
      // Wave / certains opérateurs : rediriger l'utilisateur pour valider.
      redirectUrl: result.redirect_url ?? null,
      ussdCode: result.ussd_code ?? null,
      message: result.message ?? null,
      amount,
      period,
      contexte,
      retour,
    });
  } catch (err) {
    // Log serveur complet — visible dans Vercel > Functions > Logs.
    console.error(
      "[paiement/create] initiation failed:",
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json(
      { error: "Échec de l’initiation du paiement." },
      { status: 502 },
    );
  }
}
