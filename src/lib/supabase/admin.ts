import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase ADMIN (clé service_role).
 * Nécessaire pour créer des comptes sans email de confirmation.
 * À n'utiliser QUE côté serveur, dans les server actions.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY ou URL manquant.");
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
