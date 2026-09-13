import { MagneticLink } from "./MagneticLink";

export function LandingPricing() {
  return (
    <section id="tarifs" className="bg-[#f5f5f5] px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
          Adhésion
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
          Un abonnement. Tout le Congo.
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-zinc-500">
          Débloque les contacts, les détails et la publication — Mobile Money.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-[#ebebeb] bg-white p-6 text-left shadow-sm sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              Mensuel
            </p>
            <p className="mt-3 text-4xl font-black tracking-tight text-zinc-900">
              4&nbsp;999
              <span className="ml-1 text-base font-semibold text-zinc-500">
                FCFA/mois
              </span>
            </p>
            <ul className="mt-5 space-y-2 text-sm text-zinc-600">
              <li>Contacts propriétaires débloqués</li>
              <li>Publication d’annonces</li>
              <li>Accès feed LOPANGO</li>
            </ul>
            <MagneticLink
              href="/paiement"
              variant="secondary"
              className="mt-6 w-full border border-[#ebebeb]"
            >
              Choisir mensuel
            </MagneticLink>
          </article>

          <article className="relative scale-[1.02] rounded-2xl bg-zinc-900 p-6 text-left text-white ring-2 ring-zinc-900 sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              Annuel
            </p>
            <p className="mt-3 text-4xl font-black tracking-tight">
              49&nbsp;990
              <span className="ml-1 text-base font-semibold text-zinc-400">
                FCFA/an
              </span>
            </p>
            <ul className="mt-5 space-y-2 text-sm text-zinc-300">
              <li>Deux mois offerts vs mensuel</li>
              <li>Mêmes accès illimités</li>
              <li>Idéal propriétaires actifs</li>
            </ul>
            <MagneticLink
              href="/paiement"
              variant="onDark"
              className="mt-6 w-full"
            >
              Débloquer à l’année
            </MagneticLink>
          </article>
        </div>
      </div>
    </section>
  );
}
