import { requireAdmin } from "@/lib/admin";
import { getAllReclamations } from "@/app/actions/reclamations";
import { AdminReclamationsBoard } from "@/components/admin/AdminReclamationsBoard";

export const dynamic = "force-dynamic";

export default async function AdminReclamationsPage() {
  await requireAdmin();
  const reclamations = await getAllReclamations();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-zinc-900">Réclamations</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Ce que les utilisateurs remontent — réponds directement ici.
        </p>
      </div>
      <AdminReclamationsBoard reclamations={reclamations} />
    </div>
  );
}
