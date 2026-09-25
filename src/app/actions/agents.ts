"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminPhone, isAdminUser } from "@/lib/admin";
import { isValidEmail, normalizeEmail } from "@/lib/phone";
import { normalizePhone } from "@/lib/phone";
import { revalidatePath } from "next/cache";

export type ActionResult = { ok: boolean; error?: string };

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
};

/** Liste des agents pour le tableau de bord admin (service_role). */
export async function getAdminAgents(): Promise<AgentAdminRow[]> {
  const admin = createAdminClient();
  const { data: agents } = await admin
    .from("agents")
    .select("id, phone, email, label, active, created_at")
    .order("created_at", { ascending: false });

  return agents ?? [];
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

/** Supprime définitivement un démarcheur de la liste blanche. */
export async function deleteAgent(agentId: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const admin = createAdminClient();
  const { error } = await admin.from("agents").delete().eq("id", agentId);
  if (error) return { ok: false, error: "Erreur de suppression." };
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
 * - admin (numéro ADMIN_PHONES) → toujours débloqué
 * - abonnement actif (tenant ou owner) → oui
 * - démarcheur actif AYANT publié cette annonce → oui
 * - sinon → non (les données sensibles restent masquées)
 * Source de vérité SERVEUR : le client ne peut pas la falsifier.
 */
export async function getHouseAccess(
  houseId: string,
): Promise<{
  unlocked: boolean;
  reason: "subscription" | "agent_own" | "admin" | "none";
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { unlocked: false, reason: "none" };

  // 0. Admin : accès total sans rien payer.
  if (await isAdminUser()) {
    return { unlocked: true, reason: "admin" };
  }

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
 * Enregistre une annonce comme publiée par l'agent connecté,
 * avec un snapshot des infos principales (visible côté admin).
 * Appelée après chaque publication réussie.
 */
export async function registerAgentHouse(
  houseId: string,
  snapshot?: {
    title?: string;
    price?: number;
    city?: string;
    neighborhood?: string;
    contactPhone?: string;
  },
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

  const row: Record<string, unknown> = {
    house_id: houseId,
    agent_id: agent.id,
    published_at: new Date().toISOString(),
  };
  if (snapshot?.title?.trim()) row.title = snapshot.title.trim();
  if (typeof snapshot?.price === "number" && snapshot.price > 0) {
    row.price = Math.round(snapshot.price);
  }
  if (snapshot?.city?.trim()) row.city = snapshot.city.trim();
  if (snapshot?.neighborhood?.trim()) {
    row.neighborhood = snapshot.neighborhood.trim();
  }
  if (snapshot?.contactPhone?.trim()) {
    row.contact_phone = snapshot.contactPhone.trim();
  }

  const { error } = await admin.from("agent_houses").upsert(row);
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
