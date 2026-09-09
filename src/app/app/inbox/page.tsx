import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BottomNav from "@/components/BottomNav";

export const dynamic = "force-dynamic";

export default async function AppInboxPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Messages reçus (pour les propriétaires)
  const { data: messages } = await supabase
    .from("contacts")
    .select("id, name, message, created_at")
    .eq("receiver_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="min-h-screen bg-zinc-50 pb-24 dark:bg-zinc-950">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
        <div className="mx-auto max-w-lg px-4 py-4">
          <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
            Inbox
          </h1>
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 py-4">
        {!messages || messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Aucun message pour le moment.
          </p>
        ) : (
          <div className="space-y-3">
            {(messages as { id: string; name: string; message: string; created_at: string }[]).map(
              (m) => (
                <div
                  key={m.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                    {m.name}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
                    {m.message}
                  </p>
                </div>
              ),
            )}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
