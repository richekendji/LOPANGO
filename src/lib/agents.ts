import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { normalizePhone } from "@/lib/phone";

/** Commission créditée en base par conversion (solde réel). */
export const AGENT_COMMISSION = 1000;

/** Commission affichée au démarcheur (narratif produit). */
export const AGENT_COMMISSION_DISPLAY = 4500;

export type AgentRow = {
  id: string;
  phone: string;
  label: string | null;
  active: boolean;
  created_at: string;
};

export type AgentEarningRow = {
  id: string;
  agent_id: string;
  house_id: string;
  subscriber_user_id: string | null;
  amount: number;
  created_at: string;
};

export type AgentWithdrawalRow = {
  id: string;
  agent_id: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  created_at: string;
  processed_at: string | null;
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

/** Somme des commissions — accepte toute ligne { amount }. */
export function sumEarnings(
  earnings: { amount: number | null }[],
): number {
  return earnings.reduce((acc, e) => acc + (e.amount ?? 0), 0);
}

/** Somme des retraits d'un statut donné. */
export function sumWithdrawals(
  withdrawals: { amount: number | null; status: string }[],
  status: "pending" | "approved" | "rejected",
): number {
  return withdrawals
    .filter((w) => w.status === status)
    .reduce((acc, w) => acc + (w.amount ?? 0), 0);
}

/** Solde retirable = commissions − retraits déjà approuvés ou en attente. */
export function availableBalance(
  earnings: { amount: number | null }[],
  withdrawals: { amount: number | null; status: string }[],
): number {
  const total = sumEarnings(earnings);
  const locked =
    sumWithdrawals(withdrawals, "pending") +
    sumWithdrawals(withdrawals, "approved");
  return Math.max(0, total - locked);
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

/**
 * Enregistre l'intention de paiement (annonce d'origine) pour pouvoir
 * attribuer la commission au webhook, quand la confirmation arrive.
 */
export async function recordPaymentIntent(opts: {
  externalRef: string;
  userId: string;
  houseId: string | null;
}): Promise<void> {
  if (!opts.houseId) return;
  try {
    const admin = createAdminClient();
    await admin.from("payment_intents").upsert({
      external_ref: opts.externalRef,
      user_id: opts.userId,
      house_id: opts.houseId,
    });
  } catch (err) {
    console.error(
      "[agents] recordPaymentIntent error:",
      err instanceof Error ? err.message : err,
    );
  }
}

/**
 * Attribution de la commission après un abonnement confirmé :
 * si l'utilisateur a payé depuis une annonce de démarcheur et que
 * c'est la PREMIÈRE conversion pour cette annonce → +1 000 FCFA en base
 * (affiché 4 500 au démarcheur).
 * (Contrainte unique sur house_id = "le premier utilisateur payant seulement".)
 * Anti-abus : l'agent qui s'abonne via sa propre annonce ne gagne rien.
 */
export async function processAgentCommission(opts: {
  externalRef: string;
  userId: string;
  period?: string;
}): Promise<void> {
  try {
    const admin = createAdminClient();

    const { data: intent } = await admin
      .from("payment_intents")
      .select("house_id")
      .eq("external_ref", opts.externalRef)
      .maybeSingle();
    if (!intent?.house_id) return;

    const { data: link } = await admin
      .from("agent_houses")
      .select("agent_id")
      .eq("house_id", intent.house_id)
      .maybeSingle();
    if (!link?.agent_id) return;

    // L'abonné est-il l'agent lui-même ? → pas de commission
    const [{ data: agent }, { data: subscriberProfile }] = await Promise.all([
      admin
        .from("agents")
        .select("phone, email, label")
        .eq("id", link.agent_id)
        .maybeSingle(),
      admin.from("profiles").select("phone").eq("id", opts.userId).maybeSingle(),
    ]);
    const agentPhone = normalizePhone(agent?.phone ?? "");
    const subscriberPhone = normalizePhone(subscriberProfile?.phone ?? "");
    if (agentPhone && agentPhone === subscriberPhone) return;

    // 1ʳᵉ conversion seulement : échoue silencieusement si la ligne existe déjà
    const { error } = await admin.from("agent_earnings").insert({
      agent_id: link.agent_id,
      house_id: intent.house_id,
      subscriber_user_id: opts.userId,
      amount: AGENT_COMMISSION,
    });
    if (error && !/duplicate|unique/i.test(error.message)) {
      console.error("[agents] commission insert error:", error.message);
      return;
    }
    // Doublon (webhook + polling traitent le même paiement) : pas de 2ᵉ email.
    if (error) return;

    // Commission nouvellement créée → email au démarcheur s'il a un email.
    if (agent?.email) {
      await notifyAgentPayment({
        to: agent.email,
        agentLabel: agent.label,
        period: opts.period,
        houseId: intent.house_id,
        amount: AGENT_COMMISSION,
      });
    }
  } catch (err) {
    console.error(
      "[agents] processAgentCommission error:",
      err instanceof Error ? err.message : err,
    );
  }
}

/**
 * Préviens le démarcheur par email qu'il a reçu une commission.
 * Passe par l'edge function notify-agent-payment (jamais d'API directe
 * ici : la clé du provider reste côté Supabase). Best-effort : ne casse
 * jamais le flux de paiement.
 */
async function notifyAgentPayment(opts: {
  to: string;
  agentLabel: string | null;
  period?: string;
  houseId: string;
  amount: number;
}): Promise<void> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return;

    const admin = createAdminClient();
    const { data: house } = await admin
      .from("houses")
      .select("title")
      .eq("id", opts.houseId)
      .maybeSingle();

    const res = await fetch(
      `${url.replace(/\/$/, "")}/functions/v1/notify-agent-payment`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: opts.to,
          agentLabel: opts.agentLabel,
          period: opts.period,
          amount: opts.amount,
          houseTitle: house?.title ?? null,
        }),
        signal: AbortSignal.timeout(15_000),
      },
    );
    if (!res.ok) {
      console.error(
        "[agents] notify email failed:",
        res.status,
        await res.text().catch(() => ""),
      );
    }
  } catch (err) {
    console.error(
      "[agents] notify email error:",
      err instanceof Error ? err.message : err,
    );
  }
}
