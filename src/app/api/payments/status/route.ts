import { NextResponse } from "next/server";
import { z } from "zod";
import { getSebPay } from "@/lib/sebpay";
import { createClient } from "@/lib/supabase/server";
import {
  activateSubscriptionForUser,
  parsePeriodFromExternalRef,
} from "@/lib/subscription";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { processAgentCommission } from "@/lib/agents";

const querySchema = z.object({
  ref: z.string().min(3).max(120),
});

export async function GET(request: Request) {
  const ip = clientIp(request);
  const rl = await rateLimit(`pay-status:${ip}`, { limit: 40, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Trop de requêtes." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({ ref: searchParams.get("ref") });
  if (!parsed.success) {
    return NextResponse.json({ error: "Référence invalide." }, { status: 400 });
  }

  const ref = parsed.data.ref;
  // Ref doit contenir l’UUID de l’utilisateur connecté.
  // Le préfixe "dev_" n’est valable qu’en local (NODE_ENV=development) :
  // en production il ne doit JAMAIS valider un paiement.
  const isDevRef = ref.startsWith("dev_") && process.env.NODE_ENV === "development";
  if (!ref.includes(user.id) && !isDevRef) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  try {
    if (isDevRef) {
      return NextResponse.json({
        status: "approved",
        approved: true,
        rejected: false,
        transactionId: null,
      });
    }

    const sebpay = getSebPay();
    const tx = await sebpay.getTransaction(ref);
    const status = String(tx.status ?? "pending").toLowerCase();
    const approved =
      status === "approved" || status === "success" || status === "paid";
    const rejected = status === "rejected" || status === "failed";

    if (approved) {
      const period = parsePeriodFromExternalRef(ref);
      await activateSubscriptionForUser({
        userId: user.id,
        period,
        transactionId: tx.transaction_id ?? ref,
        paymentMethod: "sebpay",
      });
      // Commission démarcheur (idempotente : unique house_id).
      try {
        await processAgentCommission({
          externalRef: ref,
          userId: user.id,
          period,
        });
      } catch {
        /* ne jamais bloquer la confirmation */
      }
    }

    return NextResponse.json({
      status,
      approved,
      rejected,
      transactionId: tx.transaction_id ?? null,
    });
  } catch (err) {
    console.error(
      "[paiement/status] verification failed:",
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json(
      { error: "Impossible de vérifier le paiement." },
      { status: 502 },
    );
  }
}
