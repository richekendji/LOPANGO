import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AgentGainsClient } from "@/components/agent/AgentGainsClient";
import { getCurrentAgent } from "@/lib/agents";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Mes gains",
  description: "Suivi de tes commissions et demandes de retrait LOPANGO.",
  path: "/app/gains",
});

export default async function AgentGainsPage() {
  const agent = await getCurrentAgent();
  if (!agent) {
    // Pas un agent (ou désactivé) → retour au feed
    redirect("/app");
  }

  return <AgentGainsClient />;
}
