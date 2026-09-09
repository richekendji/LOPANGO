import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BottomNav from "@/components/BottomNav";

export const dynamic = "force-dynamic";

export default async function AppSearchPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-24 dark:bg-zinc-950">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
        <div className="mx-auto max-w-lg px-4 py-4">
          <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
            Rechercher
          </h1>
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 py-8 text-sm text-zinc-500 dark:text-zinc-400">
        <p>La recherche par ville, quartier et prix arrive bientôt.</p>
      </main>
      <BottomNav />
    </div>
  );
}
