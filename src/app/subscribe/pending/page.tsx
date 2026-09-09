import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PaymentPendingPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; role?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center sm:px-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl">
          ⏳
        </div>
        <h1 className="mt-4 text-2xl font-bold text-zinc-900">
          Paiement en cours...
        </h1>
        <p className="mt-2 text-zinc-600">
          Validez la demande de paiement sur votre téléphone. Dès confirmation,
          votre abonnement sera activé automatiquement.
        </p>
        {params.ref && (
          <p className="mt-4 rounded-lg bg-zinc-50 p-3 text-xs text-zinc-500">
            Référence : <strong>{params.ref}</strong>
          </p>
        )}
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-xl bg-zinc-900 px-6 py-3 font-semibold text-white hover:bg-zinc-700"
        >
          Retour à mon espace
        </Link>
      </div>
    </div>
  );
}