import { NextResponse } from "next/server";
import { getCurrentAgent } from "@/lib/agents";
import { isAdminUser } from "@/lib/admin";

/**
 * Renvoie le statut démarcheur + admin de l'utilisateur connecté.
 * Utilisé côté client pour bypasser le paywall de publication,
 * détecter la saisie de son propre numéro, et donner à l'admin
 * la publication + la consultation sans abonnement.
 */
export async function GET() {
  try {
    const [agent, admin] = await Promise.all([
      getCurrentAgent(),
      isAdminUser(),
    ]);
    return NextResponse.json({
      agent: Boolean(agent),
      agentId: agent?.id ?? null,
      agentPhone: agent?.phone ?? null,
      admin,
    });
  } catch {
    return NextResponse.json({
      agent: false,
      agentId: null,
      agentPhone: null,
      admin: false,
    });
  }
}