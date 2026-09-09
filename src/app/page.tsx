import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Hero */}
      <section className="flex flex-col items-center gap-6 py-20 text-center sm:py-28">
        <h1 className="max-w-3xl text-4xl font-black tracking-tight text-zinc-900 sm:text-6xl">
          Louez ou trouvez une maison au Congo, simplement.
        </h1>
        <p className="max-w-2xl text-lg text-zinc-600">
          LOPANGO connecte les propriétaires et les locataires. Publiez votre
          maison en quelques minutes, ou trouvez le logement idéal — le tout
          depuis votre téléphone.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/register?role=owner"
            className="rounded-xl bg-emerald-600 px-6 py-3 text-base font-semibold text-white hover:bg-emerald-500"
          >
            Je suis propriétaire
          </Link>
          <Link
            href="/register?role=tenant"
            className="rounded-xl bg-zinc-900 px-6 py-3 text-base font-semibold text-white hover:bg-zinc-700"
          >
            Je cherche une maison
          </Link>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="grid gap-8 py-16 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8">
          <h2 className="text-2xl font-bold text-zinc-900">Pour les propriétaires</h2>
          <ul className="mt-4 space-y-3 text-zinc-600">
            <li>1. Créez votre compte et choisissez le rôle propriétaire</li>
            <li>2. Abonnez-vous à 12 999 FCFA / mois</li>
            <li>3. Publiez vos maisons avec photos, prix et détails</li>
            <li>4. Recevez les demandes des locataires directement</li>
          </ul>
          <Link href="/register?role=owner" className="mt-6 inline-block font-semibold text-emerald-600 hover:text-emerald-500">
            Devenir propriétaire →
          </Link>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-8">
          <h2 className="text-2xl font-bold text-zinc-900">Pour les locataires</h2>
          <ul className="mt-4 space-y-3 text-zinc-600">
            <li>1. Créez votre compte et choisissez le rôle locataire</li>
            <li>2. Abonnez-vous à 9 999 FCFA / mois</li>
            <li>3. Parcourez les maisons disponibles avec photos et prix</li>
            <li>4. Contactez directement le propriétaire</li>
          </ul>
          <Link href="/register?role=tenant" className="mt-6 inline-block font-semibold text-emerald-600 hover:text-emerald-500">
            Devenir locataire →
          </Link>
        </div>
      </section>

      {/* Bas de page */}
      <section className="flex flex-col items-center gap-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-zinc-900">
          Prêt à trouver votre maison ?
        </h2>
        <p className="max-w-xl text-zinc-600">
          Rejoignez LOPANGO dès aujourd&apos;hui et accédez aux annonces de
          maisons à louer partout au Congo-Brazzaville.
        </p>
        <Link
          href="/register"
          className="rounded-xl bg-emerald-600 px-8 py-3 text-lg font-semibold text-white hover:bg-emerald-500"
        >
          Commencer maintenant
        </Link>
      </section>
    </div>
  );
}