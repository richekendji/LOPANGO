import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { BillingPeriod } from "@/lib/pricing";
import { priceForPeriod } from "@/lib/pricing";

const DAY_MS = 24 * 60 * 60 * 1000;

export function periodDurationMs(period: BillingPeriod) {
  return period === "annuel" ? 365 * DAY_MS : 30 * DAY_MS;
}

/** Active l’abonnement côté DB (service_role). Couvre tenant + owner. */
export async function activateSubscriptionForUser(opts: {
  userId: string;
  period: BillingPeriod;
  transactionId?: string | null;
  paymentMethod?: string;
}) {
  const admin = createAdminClient();
  const now = new Date();
  const expires = new Date(now.getTime() + periodDurationMs(opts.period));
  const amount = priceForPeriod(opts.period);
  const roles = ["tenant", "owner"] as const;

  for (const role of roles) {
    const { data: existing } = await admin
      .from("subscriptions")
      .select("id")
      .eq("user_id", opts.userId)
      .eq("role", role)
      .maybeSingle();

    const row = {
      user_id: opts.userId,
      role,
      amount,
      status: "active",
      starts_at: now.toISOString(),
      expires_at: expires.toISOString(),
      payment_method: opts.paymentMethod ?? "sebpay",
      transaction_id: opts.transactionId ?? null,
    };

    if (existing?.id) {
      await admin.from("subscriptions").update(row).eq("id", existing.id);
    } else {
      await admin.from("subscriptions").insert(row);
    }
  }
}

/** Lit l’abo actif pour l’utilisateur connecté (RLS SELECT self). */
export async function getSessionSubscriptionActive(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("subscriptions")
    .select("id, expires_at, status")
    .eq("user_id", user.id)
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .limit(1);

  return Boolean(data && data.length > 0);
}

export function parsePeriodFromExternalRef(
  ref: string | null | undefined,
): BillingPeriod {
  if (ref?.includes("_annuel_")) return "annuel";
  return "mensuel";
}
