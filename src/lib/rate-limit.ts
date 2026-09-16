import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Rate limiting PERSISTANT : compteur stocké en base et incrémenté
 * atomiquement par une fonction RPC (upsert conditionnel en une
 * instruction → pas de race condition, valable sur toutes les
 * instances serverless, contrairement à une Map en mémoire).
 *
 * La table `rate_limit_buckets` a RLS activé sans policy : accessible
 * uniquement via service_role. La RPC `consume_rate_limit` est réservée
 * à service_role (EXECUTE révoqué à anon/authenticated).
 *
 * En cas d'indisponibilité DB, on échoue OUVERT (fail-open) pour ne pas
 * bloquer les paiements : le rate limit est une mesure anti-abus, pas
 * une barrière de sécurité primaire — l'authentification reste obligatoire.
 */

export type RateLimitResult = {
  ok: boolean;
  retryAfterSec: number;
};

/** Compteur persistant et atomique en DB. */
export async function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number },
): Promise<RateLimitResult> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("consume_rate_limit", {
      p_key: key,
      p_limit: opts.limit,
      p_window_sec: Math.ceil(opts.windowMs / 1000),
    });

    if (error) {
      // Fail-open : on ne bloque pas le trafic légitime si la DB est down.
      console.error(`[rate-limit] RPC error (${key}):`, error.message);
      return { ok: true, retryAfterSec: 0 };
    }

    if (data === false) {
      // Budget épuisé. Estimation du retry-after = fenêtre complète.
      return { ok: false, retryAfterSec: Math.ceil(opts.windowMs / 1000) };
    }

    return { ok: true, retryAfterSec: 0 };
  } catch (err) {
    console.error(
      "[rate-limit] unexpected error:",
      err instanceof Error ? err.message : err,
    );
    return { ok: true, retryAfterSec: 0 };
  }
}

export function clientIp(request: Request): string {
  const xf = request.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}
