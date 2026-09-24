"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminPhone } from "@/lib/admin";
import { isValidEmail, normalizeEmail } from "@/lib/phone";
import { normalizePhone } from "@/lib/phone";
import { rateLimit } from "@/lib/rate-limit";
import {
  AGENT_COMMISSION_DISPLAY,
  availableBalance,
  sumEarnings,
  sumWithdrawals,
} from "@/lib/agents";
import { revalidatePath } from "next/cache";

export type ActionResult = { ok: boolean; error?: string };

const WITHDRAWAL_MIN = 1000;

/* ------------------------------------------------------------------ */
/* Gestion admin de la liste blanche des démarcheurs                   */
/* ------------------------------------------------------------------ */

export type AgentAdminRow = {
  id: string;
  phone: string;
  email: string | null;
  label: string | null;
  active: boolean;
  created_at: string;
  total_earnings: number;
};

/** Liste des agents pour le tableau de bord admin (service_role). */
export async function getAdminAgents(): Promise<AgentAdminRow[]> {
  const admin = createAdminClient();
  const { data: agents } = await admin
    .from("agents")
    .select("id, phone, email, label, active, created_at")
    .order("created_at", { ascending: false });

  const { data: earnings } = await admin
    .from("agent_earnings")
    .select("agent_id, amount");

  const totalBy = new Map<string, number>();
  for (const e of earnings ?? []) {
    totalBy.set(e.agent_id, (totalBy.get(e.agent_id) ?? 0) + (e.amount ?? 0));
  }

  return (agents ?? []).map((a) => ({
    ...a,
    total_earnings: totalBy.get(a.id) ?? 0,
  }));
}

/** Normalise un email saisi : renvoie null (colonne vide) ou l'email valide. */
function parseAgentEmail(raw: string | null | undefined): {
  email: string | null;
  error?: string;
} {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return { email: null };
  if (!isValidEmail(trimmed)) {
    return { email: null, error: "Adresse email invalide." };
  }
  return { email: normalizeEmail(trimmed) };
}

/** Ajoute un démarcheur à la liste blanche (depuis l'interface admin). */
export async function addAgent(
  phoneRaw: string,
  label: string,
  emailRaw?: string,
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const phone = normalizePhone(phoneRaw);
  if (!phone) {
    return { ok: false, error: "Numéro invalide. Format : 06, 05 ou 04 + 123 45 67." };
  }

  const agency = label.trim();
  if (!agency) {
    return { ok: false, error: "Le nom de l'agence est obligatoire." };
  }

  const { email, error: emailError } = parseAgentEmail(emailRaw);
  if (emailError) return { ok: false, error: emailError };

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("agents")
    .select("id, active")
    .eq("phone", phone)
    .maybeSingle();

  if (existing) {
    if (existing.active) {
      return { ok: false, error: "Ce numéro est déjà démarcheur." };
    }
    // Réactivation d'un agent précédemment désactivé
    const { error } = await admin
      .from("agents")
      .update({ active: true, label: agency, email })
      .eq("id", existing.id);
    if (error) return { ok: false, error: "Erreur d'enregistrement." };
    return { ok: true };
  }

  const { error } = await admin.from("agents").insert({
    phone,
    label: agency,
    email,
    active: true,
  });
  if (error) {
    console.error("[agents] add error:", error.message);
    return { ok: false, error: "Erreur d'enregistrement." };
  }
  return { ok: true };
}

/** Modifie un démarcheur existant (label, email, statut). */
export async function updateAgent(
  agentId: string,
  patch: { label?: string; email?: string | null },
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const update: { label?: string; email?: string | null } = {};

  if (patch.label !== undefined) {
    const agency = patch.label.trim();
    if (!agency) {
      return { ok: false, error: "Le nom de l'agence est obligatoire." };
    }
    update.label = agency;
  }

  if (patch.email !== undefined) {
    const { email, error } = parseAgentEmail(patch.email);
    if (error) return { ok: false, error };
    update.email = email;
  }

  if (Object.keys(update).length === 0) {
    return { ok: true };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("agents")
    .update(update)
    .eq("id", agentId);
  if (error) {
    console.error("[agents] update error:", error.message);
    return { ok: false, error: "Erreur d'enregistrement." };
  }
  revalidatePath("/admin/agents");
  revalidatePath("/admin");
  return { ok: true };
}

/** Active / désactive un démarcheur. */
export async function setAgentActive(
  agentId: string,
  active: boolean,
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const admin = createAdminClient();
  const { error } = await admin
    .from("agents")
    .update({ active })
    .eq("id", agentId);
  if (error) return { ok: false, error: "Erreur d'enregistrement." };
  return { ok: true };
}

/** Supprime définitivement un démarcheur (cascades sur ses gains/retraits). */
export async function deleteAgent(agentId: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const admin = createAdminClient();
  const { error } = await admin.from("agents").delete().eq("id", agentId);
  if (error) return { ok: false, error: "Erreur de suppression." };
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Côté agent : gains + demandes de retrait                            */
/* ------------------------------------------------------------------ */

export type AgentEarningsData = {
  total: number;
  pending: number;
  paid: number;
  balance: number;
  commission: number;
  earnings: {
    id: string;
    house_id: string;
    amount: number;
    created_at: string;
  }[];
  withdrawals: {
    id: string;
    amount: number;
    status: "pending" | "approved" | "rejected";
    admin_note: string | null;
    created_at: string;
  }[];
};

/** Données du compte agent connecté (compteurs + historiques). */
export async function getMyAgentEarnings(): Promise<{
  ok: boolean;
  error?: string;
  data?: AgentEarningsData;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "non-auth" };

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("phone")
    .eq("id", user.id)
    .maybeSingle();
  const phone = normalizePhone(profile?.phone ?? "");
  if (!phone) return { ok: false, error: "non-agent" };

  const { data: agent } = await admin
    .from("agents")
    .select("id, phone, label, active")
    .eq("phone", phone)
    .eq("active", true)
    .maybeSingle();
  if (!agent) return { ok: false, error: "non-agent" };

  const [{ data: earnings }, { data: withdrawals }] = await Promise.all([
    admin
      .from("agent_earnings")
      .select("id, house_id, amount, created_at")
      .eq("agent_id", agent.id)
      .order("created_at", { ascending: false }),
    admin
      .from("agent_withdrawals")
      .select("id, amount, status, admin_note, created_at")
      .eq("agent_id", agent.id)
      .order("created_at", { ascending: false }),
  ]);

  const e = earnings ?? [];
  const w = withdrawals ?? [];

  return {
    ok: true,
    data: {
      total: sumEarnings(e),
      pending: sumWithdrawals(w, "pending"),
      paid: sumWithdrawals(w, "approved"),
      balance: availableBalance(e, w),
      commission: AGENT_COMMISSION_DISPLAY,
      earnings: e,
      withdrawals: w,
    },
  };
}

/** L'agent connecté demande le retrait de son solde disponible. */
export async function requestWithdrawal(
  amountRaw: number,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "non-auth" };

  const rl = await rateLimit(`withdrawal:${user.id}`, {
    limit: 3,
    windowMs: 24 * 60 * 60 * 1000,
  });
  if (!rl.ok) {
    return {
      ok: false,
      error: "Trop de demandes. Réessaie demain.",
    };
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("phone")
    .eq("id", user.id)
    .maybeSingle();
  const phone = normalizePhone(profile?.phone ?? "");
  if (!phone) return { ok: false, error: "non-agent" };

  const { data: agent } = await admin
    .from("agents")
    .select("id")
    .eq("phone", phone)
    .eq("active", true)
    .maybeSingle();
  if (!agent) return { ok: false, error: "non-agent" };

  const amount = Math.floor(Number(amountRaw));
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Montant invalide." };
  }

  // Recalcul serveur du solde disponible (jamais une valeur envoyée par le client)
  const [{ data: earnings }, { data: withdrawals }] = await Promise.all([
    admin
      .from("agent_earnings")
      .select("agent_id, amount")
      .eq("agent_id", agent.id),
    admin
      .from("agent_withdrawals")
      .select("amount, status")
      .eq("agent_id", agent.id),
  ]);
  const balance = availableBalance(
    earnings ?? [],
    withdrawals ?? [],
  );
  if (amount < WITHDRAWAL_MIN) {
    return { ok: false, error: `Retrait minimum : ${WITHDRAWAL_MIN} FCFA.` };
  }
  if (amount > balance) {
    return { ok: false, error: "Montant supérieur au solde disponible." };
  }

  const { error } = await admin.from("agent_withdrawals").insert({
    agent_id: agent.id,
    amount,
  });
  if (error) {
    console.error("[agents] withdrawal insert error:", error.message);
    return { ok: false, error: "Erreur d'enregistrement." };
  }

  revalidatePath("/app/gains");
  revalidatePath("/admin/agents");
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Côté admin : validation des retraits                                */
/* ------------------------------------------------------------------ */

export type AdminWithdrawalRow = {
  id: string;
  agent_id: string;
  agent_phone: string | null;
  agent_label: string | null;
  amount: number;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  created_at: string;
};

/** Tous les retraits pour le tableau de bord admin. */
export async function getAdminWithdrawals(): Promise<AdminWithdrawalRow[]> {
  const admin = createAdminClient();
  const [{ data: withdrawals }, { data: agents }] = await Promise.all([
    admin
      .from("agent_withdrawals")
      .select("id, agent_id, amount, status, admin_note, created_at")
      .order("created_at", { ascending: false }),
    admin.from("agents").select("id, phone, label"),
  ]);

  const byAgent = new Map<string, { phone: string; label: string | null }>();
  for (const a of agents ?? []) {
    byAgent.set(a.id, { phone: a.phone, label: a.label });
  }

  return (withdrawals ?? []).map((w) => {
    const a = byAgent.get(w.agent_id);
    return { ...w, agent_phone: a?.phone ?? null, agent_label: a?.label ?? null };
  });
}

/** Valide ou refuse une demande de retrait. */
export async function processWithdrawal(
  withdrawalId: string,
  approve: boolean,
  note: string,
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const admin = createAdminClient();
  const { error } = await admin
    .from("agent_withdrawals")
    .update({
      status: approve ? "approved" : "rejected",
      admin_note: note.trim() || null,
      processed_at: new Date().toISOString(),
    })
    .eq("id", withdrawalId)
    .eq("status", "pending");

  if (error) {
    console.error("[agents] withdrawal process error:", error.message);
    return { ok: false, error: "Erreur d'enregistrement." };
  }

  revalidatePath("/admin/agents");
  revalidatePath("/app/gains");
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Accès aux annonces pour l'agent connecté                            */
/* ------------------------------------------------------------------ */

/** L'agent connecté peut-il consulter cette annonce sans payer ?
 * Oui uniquement si l'annonce a été publiée par lui (agent_houses).
 */
export async function canAgentViewHouse(houseId: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("phone")
    .eq("id", user.id)
    .maybeSingle();
  const phone = normalizePhone(profile?.phone ?? "");
  if (!phone) return false;

  const { data: agent } = await admin
    .from("agents")
    .select("id")
    .eq("phone", phone)
    .eq("active", true)
    .maybeSingle();
  if (!agent) return false;

  const { data: link } = await admin
    .from("agent_houses")
    .select("house_id")
    .eq("house_id", houseId)
    .eq("agent_id", agent.id)
    .maybeSingle();
  return Boolean(link);
}

/**
 * Accès complet à une annonce publique ?
 * - abonnement actif (tenant ou owner) → oui
 * - démarcheur actif AYANT publié cette annonce → oui
 * - sinon → non (les données sensibles restent masquées)
 * Source de vérité SERVEUR : le client ne peut pas la falsifier.
 */
export async function getHouseAccess(
  houseId: string,
): Promise<{ unlocked: boolean; reason: "subscription" | "agent_own" | "none" }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { unlocked: false, reason: "none" };

  // 1. Abonnement actif ?
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .limit(1);
  if (subs && subs.length > 0) {
    return { unlocked: true, reason: "subscription" };
  }

  // 2. Démarcheur actif, propriétaire de l'annonce ?
  if (await canAgentViewHouse(houseId)) {
    return { unlocked: true, reason: "agent_own" };
  }

  return { unlocked: false, reason: "none" };
}

/**
 * Enregistre une annonce comme publiée par l'agent connecté.
 * Appelée après chaque publication réussie : c'est ce lien qui
 * déclenche la commission 4 500 (1 000 en base) à la 1ʳᵉ conversion payante.
 */
export async function registerAgentHouse(
  houseId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "non-auth" };

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("phone")
    .eq("id", user.id)
    .maybeSingle();
  const phone = normalizePhone(profile?.phone ?? "");
  if (!phone) return { ok: false, error: "non-agent" };

  const { data: agent } = await admin
    .from("agents")
    .select("id")
    .eq("phone", phone)
    .eq("active", true)
    .maybeSingle();
  if (!agent) return { ok: false, error: "non-agent" };

  const { error } = await admin
    .from("agent_houses")
    .upsert({ house_id: houseId, agent_id: agent.id });
  if (error) {
    console.error("[agents] register house error:", error.message);
    return { ok: false, error: "Erreur d'enregistrement." };
  }
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Garde-fou admin                                                     */
/* ------------------------------------------------------------------ */

async function requireAdmin(): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "interdit" };

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("phone")
      .eq("id", user.id)
      .maybeSingle();
    if (!isAdminPhone(profile?.phone)) {
      return { ok: false, error: "interdit" };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "interdit" };
  }
}
