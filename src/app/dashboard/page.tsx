import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SUBSCRIPTION_PRICES } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Profil utilisateur
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // Abonnements actifs
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const now = new Date();
  const activeOwner = subscriptions?.find(
    (s) => s.role === "owner" && s.status === "active" && new Date(s.expires_at) > now,
  );
  const activeTenant = subscriptions?.find(
    (s) => s.role === "tenant" && s.status === "active" && new Date(s.expires_at) > now,
  );

  const role = profile?.role ?? (activeOwner ? "owner" : activeTenant ? "tenant" : null);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="text-2xl font-black text-zinc-900 sm:text-3xl">
        Bonjour, {profile?.full_name || user.email} 👋
      </h1>

      {/* État des abonnements */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-bold text-zinc-900">
            Abonnement propriétaire
          </h2>
          {activeOwner ? (
            <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
              Actif jusqu&apos;au{" "}
              <strong>
                {new Date(activeOwner.expires_at).toLocaleDateString("fr-FR")}
              </strong>
            </div>
          ) : (
            <div className="mt-3 text-sm text-zinc-500">
              Pas d&apos;abonnement propriétaire actif.
            </div>
          )}
          <Link
            href={`/subscribe?role=owner`}
            className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            {activeOwner ? "Renouveler" : `Souscrire — ${SUBSCRIPTION_PRICES.owner.toLocaleString("fr-FR")} FCFA/mois`}
          </Link>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-bold text-zinc-900">
            Abonnement locataire
          </h2>
          {activeTenant ? (
            <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
              Actif jusqu&apos;au{" "}
              <strong>
                {new Date(activeTenant.expires_at).toLocaleDateString("fr-FR")}
              </strong>
            </div>
          ) : (
            <div className="mt-3 text-sm text-zinc-500">
              Pas d&apos;abonnement locataire actif.
            </div>
          )}
          <Link
            href={`/subscribe?role=tenant`}
            className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            {activeTenant ? "Renouveler" : `Souscrire — ${SUBSCRIPTION_PRICES.tenant.toLocaleString("fr-FR")} FCFA/mois`}
          </Link>
        </div>
      </section>

      {/* Zone par rôle */}
      <section className="mt-8">
        {role === "owner" ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-bold text-zinc-900">Mes maisons</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                href="/dashboard/houses/new"
                className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 hover:border-emerald-500 hover:text-emerald-600"
              >
                <span className="text-2xl">+</span>
                <span className="mt-1 font-semibold">Ajouter une maison</span>
              </Link>
              <Link
                href="/dashboard/houses"
                className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 p-6 text-center text-sm text-zinc-600 hover:border-zinc-400"
              >
                <span className="text-2xl">🏠</span>
                <span className="mt-1 font-semibold">Gérer mes maisons</span>
              </Link>
              <Link
                href="/dashboard/messages"
                className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 p-6 text-center text-sm text-zinc-600 hover:border-zinc-400"
              >
                <span className="text-2xl">📩</span>
                <span className="mt-1 font-semibold">Messages reçus</span>
              </Link>
            </div>
          </div>
        ) : role === "tenant" ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-bold text-zinc-900">Rechercher un logement</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Parcourez les maisons disponibles et contactez les propriétaires.
            </p>
            <Link
              href="/houses"
              className="mt-4 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
            >
              Voir les maisons →
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center">
            <h2 className="text-lg font-bold text-zinc-900">
              Choisissez votre abonnement pour commencer
            </h2>
            <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/subscribe?role=owner"
                className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-500"
              >
                Propriétaire — 12 999 FCFA/mois
              </Link>
              <Link
                href="/subscribe?role=tenant"
                className="rounded-xl bg-zinc-900 px-6 py-3 font-semibold text-white hover:bg-zinc-700"
              >
                Locataire — 9 999 FCFA/mois
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}