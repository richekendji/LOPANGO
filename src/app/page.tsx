import Image from "next/image";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative isolate flex min-h-[72svh] items-end overflow-hidden sm:min-h-[680px]">
        <Image
          src="/hero-house.png"
          alt="Belle maison à louer au Congo"
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 pb-12 sm:px-6 sm:pb-16">
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <button
              type="button"
              className="w-full rounded-xl bg-emerald-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg hover:bg-emerald-500 sm:w-auto"
            >
              Je suis propriétaire
            </button>
            <button
              type="button"
              className="w-full rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-zinc-900 shadow-lg hover:bg-zinc-100 sm:w-auto"
            >
              Je cherche une maison
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Comment ça marche */}
        <section className="grid gap-6 py-12 sm:grid-cols-2 sm:gap-8 sm:py-16">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800/60 sm:p-8">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Pour les propriétaires
            </h2>
            <ul className="mt-4 space-y-3 text-zinc-600 dark:text-zinc-300">
              <li>1. Créez votre compte et choisissez le rôle propriétaire</li>
              <li>2. Abonnez-vous à 12 999 FCFA / mois</li>
              <li>3. Publiez vos maisons avec photos, prix et détails</li>
              <li>4. Recevez les demandes des locataires directement</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800/60 sm:p-8">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Pour les locataires
            </h2>
            <ul className="mt-4 space-y-3 text-zinc-600 dark:text-zinc-300">
              <li>1. Créez votre compte et choisissez le rôle locataire</li>
              <li>2. Abonnez-vous à 9 999 FCFA / mois</li>
              <li>3. Parcourez les maisons disponibles avec photos et prix</li>
              <li>4. Contactez directement le propriétaire</li>
            </ul>
          </div>
        </section>

        {/* Bas de page */}
        <section className="flex flex-col items-center gap-4 py-12 text-center sm:py-16">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Prêt à trouver votre maison ?
          </h2>
          <p className="max-w-xl text-zinc-600 dark:text-zinc-300">
            Rejoignez LOPANGO dès aujourd&apos;hui et accédez aux annonces de
            maisons à louer partout au Congo-Brazzaville.
          </p>
          <button
            type="button"
            className="w-full max-w-sm rounded-xl bg-emerald-600 px-8 py-3.5 text-lg font-semibold text-white hover:bg-emerald-500 sm:w-auto"
          >
            Commencer maintenant
          </button>
        </section>
      </div>
    </div>
  );
}
