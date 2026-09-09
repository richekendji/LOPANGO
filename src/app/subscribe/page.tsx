import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SUBSCRIPTION_PRICES } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function SubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; error?: string }>;
}) {
  const params = await searchParams;
  const role = params.role === "owner" ? "owner" : "tenant";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/subscribe?role=${role}`);
  }

  const price = SUBSCRIPTION_PRICES[role];
  const labels = {
    owner: { title: "Propriétaire", subtitle: "Publiez vos maisons et recevez les demandes des locataires." },
    tenant: { title: "Locataire", subtitle: "Accédez au catalogue des maisons et contactez les propriétaires." },
  }[role];

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-black text-zinc-900 sm:text-4xl">
        Abonnement {labels.title}
      </h1>
      <p className="mt-2 text-zinc-600">{labels.subtitle}</p>

      <div className="mt-6 rounded-2xl border-2 border-amber-400 bg-amber-50 p-6 sm:p-8">
        <div className="text-center">
          <span className="inline-block rounded-full bg-amber-200 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">
            Mode démo — paiement désactivé
          </span>
          <p className="mt-4 text-zinc-700">
            L&apos;abonnement <strong>{labels.title}</strong> est{" "}
            <strong>activé automatiquement</strong> pendant la phase de
            démonstration. Aucun paiement n&apos;est demandé.
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Prix normal : {price.toLocaleString("fr-FR")} FCFA / 30 jours
            (réactivé plus tard).
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="rounded-xl bg-emerald-600 px-6 py-3.5 text-center font-semibold text-white hover:bg-emerald-500"
          >
            Accéder à mon espace
          </Link>
          <Link
            href="/houses"
            className="rounded-xl border border-zinc-300 bg-white px-6 py-3.5 text-center font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            Voir les maisons
          </Link>
        </div>
      </div>
    </div>
  );
}
