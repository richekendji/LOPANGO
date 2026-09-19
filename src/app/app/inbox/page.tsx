import { redirect } from "next/navigation";
import { InboxClient } from "@/components/app/InboxClient";
import { getCurrentAgent } from "@/lib/agents";

export default async function InboxPage() {
  // Les démarcheurs ont l'onglet « Retirer » à la place de « Réclamation ».
  const agent = await getCurrentAgent();
  if (agent) redirect("/app/gains");
  return <InboxClient />;
}
