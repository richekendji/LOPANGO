import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { normalizePhone } from "@/lib/phone";

export type AgentRow = {
  id: string;
  phone: string;
  label: string | null;
  active: boolean;
  created_at: string;
};

/**
 * L'utilisateur connecté est-il un démarcheur (liste blanche, actif) ?
 * Renvoie la ligne agent si oui, sinon null.
 */
export async function getCurrentAgent(): Promise<AgentRow | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("phone")
      .eq("id", user.id)
      .maybeSingle();
    const phone = normalizePhone(profile?.phone ?? "");
    if (!phone) return null;

    const { data: agent } = await admin
      .from("agents")
      .select("id, phone, label, active, created_at")
      .eq("phone", phone)
      .eq("active", true)
      .maybeSingle();

    return (agent as AgentRow | null) ?? null;
  } catch {
    return null;
  }
}

/** Le numéro correspond-il à un agent actif de la liste blanche ? */
export async function findAgentByPhone(
  phone: string | null | undefined,
): Promise<AgentRow | null> {
  const n = normalizePhone(phone ?? "");
  if (!n) return null;
  try {
    const admin = createAdminClient();
    const { data: agent } = await admin
      .from("agents")
      .select("id, phone, label, active, created_at")
      .eq("phone", n)
      .eq("active", true)
      .maybeSingle();
    return (agent as AgentRow | null) ?? null;
  } catch {
    return null;
  }
}

/** L'annonce appartient-elle à cet agent ? (annonce enregistrée via agent_houses) */
export async function isAgentHouse(
  houseId: string,
  agentId: string,
): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("agent_houses")
      .select("house_id")
      .eq("house_id", houseId)
      .eq("agent_id", agentId)
      .maybeSingle();
    return Boolean(data);
  } catch {
    return false;
  }
}