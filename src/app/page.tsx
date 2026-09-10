import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-white">
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="text-xl font-black tracking-tight text-zinc-900"
          >
            LOPANGO
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              S&apos;inscrire
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
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
              <Link
                href="/register?role=owner"
                className="w-full rounded-xl bg-zinc-900 px-6 py-3.5 text-center text-base font-semibold text-white shadow-lg hover:bg-zinc-800 sm:w-auto"
              >
                Je suis propriétaire
              </Link>
              <Link
                href="/register?role=tenant"
                className="w-full rounded-xl bg-white px-6 py-3.5 text-center text-base font-semibold text-zinc-900 shadow-lg hover:bg-zinc-100 sm:w-auto"
              >
                Je cherche une maison
              </Link>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <section className="grid gap-6 py-12 sm:grid-cols-2 sm:gap-8 sm:py-16">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-zinc-900">
                Pour les propriétaires
              </h2>
              <ul className="mt-4 space-y-3 text-zinc-600">
                <li>1. Compte avec prénom, nom, numéro et mot de passe</li>
                <li>2. Publiez vos maisons avec photos, prix et détails</li>
                <li>3. Recevez les demandes des locataires directement</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-zinc-900">
                Pour les locataires
              </h2>
              <ul className="mt-4 space-y-3 text-zinc-600">
                <li>1. Compte avec prénom, nom, numéro et mot de passe</li>
                <li>2. Parcourez les maisons partout au Congo</li>
                <li>3. Contactez directement le propriétaire</li>
              </ul>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-zinc-200 py-6 text-center text-sm text-zinc-500">
        LOPANGO — Location de maisons au Congo
      </footer>
    </div>
  );
}
