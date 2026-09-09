import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SUBSCRIPTION_PRICES } from "@/lib/pricing";
import { createSubscription } from "@/app/actions/subscription";

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
      <h1 className="text-3xl font-black text-zinc-900">
        Abonnement {labels.title}
      </h1>
      <p className="mt-2 text-zinc-600">{labels.subtitle}</p>

      {params.error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {params.error}
        </div>
      )}

      <div className="mt-6 rounded-2xl border-2 border-emerald-500 bg-white p-8">
        <div className="text-center">
          <p className="text-sm uppercase tracking-wide text-zinc-500">
            Payable en Mobile Money
          </p>
          <p className="mt-2 text-5xl font-black text-zinc-900">
            {price.toLocaleString("fr-FR")}
            <span className="text-xl font-bold text-zinc-500"> FCFA</span>
          </p>
          <p className="mt-1 text-sm text-zinc-500">/ 30 jours</p>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium text-zinc-700">
            Choisissez votre moyen de paiement :
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-zinc-300 px-4 py-3 font-semibold text-zinc-700">
              <input type="radio" name="method" value="MTN" defaultChecked />
              MTN MoMo
            </label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-zinc-300 px-4 py-3 font-semibold text-zinc-700">
              <input type="radio" name="method" value="AIRTEL" />
              Airtel Money
            </label>
          </div>
        </div>

        <p className="mt-5 text-sm text-zinc-600">
          Après validation, vous recevrez une notification sur votre téléphone
          pour confirmer le paiement.
        </p>

        <form action={createSubscription} className="mt-6">
          <input type="hidden" name="role" value={role} />
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
            Numéro Mobile Money
            <input
              name="phone"
              type="tel"
              required
              className="rounded-lg border border-zinc-300 px-3 py-2 text-lg focus:border-emerald-500 focus:outline-none"
              placeholder="+242 06 000 00 00"
            />
          </label>
          <button
            type="submit"
            className="mt-4 w-full rounded-xl bg-emerald-600 px-6 py-3 text-lg font-bold text-white hover:bg-emerald-500"
          >
            Payer {price.toLocaleString("fr-FR")} FCFA
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-zinc-400">
          Paiement sécurisé. En cas de problème, contactez le support LOPANGO.
        </p>
      </div>

      <p className="mt-8 text-center text-sm text-zinc-600">
        <Link href="/dashboard" className="font-medium hover:text-zinc-900">
          ← Retour à mon espace
        </Link>
      </p>
    </div>
  );
}