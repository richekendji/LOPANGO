import { NextResponse } from "next/server";
import { getCurrentAgent } from "@/lib/agents";

/**
 * Renvoie le statut démarcheur de l'utilisateur connecté.
 * Utilisé côté client pour bypasser le paywall de publication
 * et détecter la saisie de son propre numéro dans le formulaire.
 */
export async function GET() {
  try {
    const agent = await getCurrentAgent();
    return NextResponse.json({
      agent: Boolean(agent),
      agentId: agent?.id ?? null,
      agentPhone: agent?.phone ?? null,
    });
  } catch {
    return NextResponse.json({
      agent: false,
      agentId: null,
      agentPhone: null,
    });
  }
}
