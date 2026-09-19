"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminPhone } from "@/lib/admin";
import { rateLimit } from "@/lib/rate-limit";

export type ReclamationStatus = "open" | "in_progress" | "resolved";

export type ReclamationRow = {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: ReclamationStatus;
  admin_reply: string | null;
  created_at: string;
  updated_at: string;
  /** Côté admin uniquement : infos du profil. */
  author_name?: string | null;
  author_phone?: string | null;
};

export type ReclamationResult = {
  ok: boolean;
  error?: string;
};

const SUBJECT_MAX = 120;
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 2000;

/**
 * Crée une réclamation pour l'utilisateur connecté.
 * Rate limité (5 / heure / utilisateur) pour éviter le spam.
 */
export async function createReclamation(
  formData: FormData,
): Promise<ReclamationResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "non-auth" };

  // Anti-spam : 5 réclamations max par heure et par utilisateur
  const rl = await rateLimit(`reclamations:${user.id}`, {
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.ok) {
    return {
      ok: false,
      error: `Trop de réclamations envoyées. Réessaie dans ${rl.retryAfterSec >= 60 ? `${Math.ceil(rl.retryAfterSec / 60)} min` : `${rl.retryAfterSec} s`}.`,
    };
  }

  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!subject || subject.length > SUBJECT_MAX) {
    return { ok: false, error: `L'objet doit faire entre 1 et ${SUBJECT_MAX} caractères.` };
  }
  if (message.length < MESSAGE_MIN || message.length > MESSAGE_MAX) {
    return {
      ok: false,
      error: `Le message doit faire entre ${MESSAGE_MIN} et ${MESSAGE_MAX} caractères.`,
    };
  }

  const { error } = await supabase.from("reclamations").insert({
    user_id: user.id,
    subject,
    message,
  });

  if (error) {
    console.error("[reclamations] insert error:", error.message);
    return { ok: false, error: "Erreur d'enregistrement. Réessaie." };
  }

  return { ok: true };
}

/** Réclamations de l'utilisateur connecté (plus récentes d'abord). */
export async function getMyReclamations(): Promise<ReclamationRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("reclamations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[reclamations] select error:", error.message);
    return [];
  }
  return (data ?? []) as ReclamationRow[];
}

/**
 * Toutes les réclamations (côté admin, via service_role).
 * Join profiles pour afficher qui a écrit.
 */
export async function getAllReclamations(): Promise<ReclamationRow[]> {
  const admin = createAdminClient();
  const [{ data: recs }, { data: profiles }] = await Promise.all([
    admin
      .from("reclamations")
      .select("*")
      .order("created_at", { ascending: false }),
    admin.from("profiles").select("id, full_name, phone"),
  ]);

  const byUser = new Map<string, { full_name: string | null; phone: string | null }>();
  for (const p of profiles ?? []) {
    byUser.set(p.id, { full_name: p.full_name, phone: p.phone });
  }

  return (recs ?? []).map((r) => {
    const p = byUser.get(r.user_id);
    return {
      ...r,
      author_name: p?.full_name ?? null,
      author_phone: p?.phone ?? null,
    } as ReclamationRow;
  });
}

/** Réponse admin : enregistre la réponse et passe le statut à "in_progress"/"resolved". */
export async function replyToReclamation(
  reclamationId: string,
  reply: string,
  resolve: boolean,
): Promise<ReclamationResult> {
  const admin = createAdminClient();

  // Garde-fou : l'appelant doit être admin (vérif via session + profiles)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "non-auth" };

  const { data: profile } = await admin
    .from("profiles")
    .select("phone")
    .eq("id", user.id)
    .maybeSingle();
  if (!isAdminPhone(profile?.phone)) {
    return { ok: false, error: "interdit" };
  }

  const trimmed = reply.trim();
  if (!trimmed || trimmed.length > MESSAGE_MAX) {
    return { ok: false, error: "Réponse vide ou trop longue." };
  }

  const { error } = await admin
    .from("reclamations")
    .update({
      admin_reply: trimmed,
      status: resolve ? "resolved" : "in_progress",
      updated_at: new Date().toISOString(),
    })
    .eq("id", reclamationId);

  if (error) {
    console.error("[reclamations] reply error:", error.message);
    return { ok: false, error: "Erreur d'enregistrement." };
  }
  return { ok: true };
}
