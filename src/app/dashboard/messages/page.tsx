import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Messages adressés à l'utilisateur, avec le titre de la maison
  const { data: messages } = await supabase
    .from("contacts")
    .select("id, name, phone, message, created_at, houses(title)")
    .eq("receiver_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-black text-zinc-900">Messages reçus</h1>
      <p className="mt-1 text-zinc-600">
        Les demandes des locataires intéressés par vos maisons.
      </p>

      {!messages || messages.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center text-zinc-500">
          Aucun message pour le moment.
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {messages.map((m) => (
            <div key={m.id} className="rounded-2xl border border-zinc-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-zinc-900">{m.name}</p>
                  <p className="text-sm text-zinc-500">{m.phone}</p>
                </div>
                <p className="text-xs text-zinc-400">
                  {new Date(m.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <p className="mt-3 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-700">
                {m.message}
              </p>
              {m.houses?.title && (
                <p className="mt-2 text-xs text-zinc-500">
                  À propos de : <strong>{m.houses.title}</strong>
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}