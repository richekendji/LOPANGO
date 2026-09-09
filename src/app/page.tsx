import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative isolate flex min-h-[560px] items-end overflow-hidden sm:min-h-[680px]">
        <Image
          src="/hero-house.png"
          alt="Belle maison à louer au Congo"
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 pb-16 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register?role=owner"
              className="rounded-xl bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-emerald-500"
            >
              Je suis propriétaire
            </Link>
            <Link
              href="/register?role=tenant"
              className="rounded-xl bg-white px-6 py-3 text-base font-semibold text-zinc-900 shadow-lg hover:bg-zinc-100"
            >
              Je cherche une maison
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Comment ça marche */}
      <section className="grid gap-8 py-16 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-700 dark:bg-zinc-800/60">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Pour les propriétaires</h2>
          <ul className="mt-4 space-y-3 text-zinc-600 dark:text-zinc-300">
            <li>1. Créez votre compte et choisissez le rôle propriétaire</li>
            <li>2. Abonnez-vous à 12 999 FCFA / mois</li>
            <li>3. Publiez vos maisons avec photos, prix et détails</li>
            <li>4. Recevez les demandes des locataires directement</li>
          </ul>
          <Link href="/register?role=owner" className="mt-6 inline-block font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400">
            Devenir propriétaire →
          </Link>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-700 dark:bg-zinc-800/60">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Pour les locataires</h2>
          <ul className="mt-4 space-y-3 text-zinc-600 dark:text-zinc-300">
            <li>1. Créez votre compte et choisissez le rôle locataire</li>
            <li>2. Abonnez-vous à 9 999 FCFA / mois</li>
            <li>3. Parcourez les maisons disponibles avec photos et prix</li>
            <li>4. Contactez directement le propriétaire</li>
          </ul>
          <Link href="/register?role=tenant" className="mt-6 inline-block font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400">
            Devenir locataire →
          </Link>
        </div>
      </section>

      {/* Bas de page */}
      <section className="flex flex-col items-center gap-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">
          Prêt à trouver votre maison ?
        </h2>
        <p className="max-w-xl text-zinc-600 dark:text-zinc-300">
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
    </div>
  );
}
