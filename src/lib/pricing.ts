export const PRICE_MENSUEL = 4999;
export const PRICE_ANNUEL = 49990;
export const CURRENCY = "XAF";
export const COUNTRY = "CG";
export const SUBSCRIPTION_DURATION_DAYS = 30;

export type BillingPeriod = "mensuel" | "annuel";

export function priceForPeriod(period: BillingPeriod) {
  return period === "annuel" ? PRICE_ANNUEL : PRICE_MENSUEL;
}

/** Opérateurs Mobile Money Congo-Brazzaville (slugs SebPay). */
export const CONGO_OPERATORS = [
  { slug: "mtn", label: "MTN MoMo" },
  { slug: "airtel", label: "Airtel Money" },
] as const;
