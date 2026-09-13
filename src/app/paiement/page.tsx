"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import {
  CONGO_OPERATORS,
  PRICE_ANNUEL,
  PRICE_MENSUEL,
  type BillingPeriod,
} from "@/lib/pricing";
import { formatFcfa } from "@/lib/mock/houses";
import {
  getPaiementPeriod,
  refreshSubscriptionStatus,
  savePaiementPeriod,
  setSubscriptionActive,
} from "@/lib/mock/store";
import { SelectField } from "@/components/SelectField";

const ARGUMENTS_LOCATAIRE = [
  "Accès direct aux contacts de plus de 1 000 propriétaires dans tout le Congo",
  "Fini les démarcheurs qui font perdre du temps et de l’argent",
  "Zéro frais de visite",
  "Aucun mois supplémentaire imposé",
  "Tu parles directement au propriétaire — vous vous arrangez entre vous",
  "Adresse de la parcelle, numéro et détails de la maison débloqués",
  "Maisons à Brazzaville, Pointe-Noire et partout au Congo",
  "Toi seul décides. Toi seul choisis.",
];

const ARGUMENTS_PUBLIER = [
  "Tu publies toi-même = tu te protèges — un bien que tu contrôles, c’est un bien que l’État n’a aucune raison de toucher",
  "Ton bien reste le tien — personne ne le filme, personne ne réclame des frais à ta place",
  "Plus de démarcheurs. Plus de risques. Ton nom sur ton bien. Ta maison debout.",
  "Des locataires sérieux te contactent directement — zéro intermédiaire, zéro commission",
  "Visible partout au Congo — Brazzaville, Pointe-Noire, et au-delà",
  "Ils t’écrivent. Tu réponds. Vous vous arrangez. C’est tout.",
  "Tu restes maître chez toi — tu choisis qui visite, qui loue, à quel prix",
  "Présente tout ce qui fait la valeur — chambres, cuisine, parking, clôture…",
  "Un seul abonnement pour publier, gérer et protéger tous tes biens",
];

function buildReturnUrl(retour: string) {
  return retour.startsWith("/") ? retour : "/app";
}

function PaiementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const retour = searchParams.get("retour") || "/app";
  const contexte = searchParams.get("contexte") || "voir";
  const isPublier = contexte === "publier";
  const backHref = isPublier
    ? "/app"
    : retour.startsWith("/")
      ? retour.split("?")[0] || "/app"
      : "/app";

  const [period, setPeriod] = useState<BillingPeriod>("mensuel");
  const [phone, setPhone] = useState("+242 ");
  const [operator, setOperator] =
    useState<(typeof CONGO_OPERATORS)[number]["slug"]>(CONGO_OPERATORS[0].slug);
  const [otpCode, setOtpCode] = useState("");
  const [needOtp, setNeedOtp] = useState(false);
  const [ussdCode, setUssdCode] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [externalRef, setExternalRef] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setPeriod(getPaiementPeriod());
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  function choosePeriod(next: BillingPeriod) {
    setPeriod(next);
    savePaiementPeriod(next);
  }

  const price = period === "mensuel" ? PRICE_MENSUEL : PRICE_ANNUEL;
  const priceSuffix = period === "mensuel" ? "/mois" : "/an";
  const argumentsList = isPublier ? ARGUMENTS_PUBLIER : ARGUMENTS_LOCATAIRE;

  async function finishSuccess() {
    if (pollRef.current) clearInterval(pollRef.current);
    await refreshSubscriptionStatus();
    setSubscriptionActive(true);
    setPolling(false);
    setPaying(false);
    router.replace(buildReturnUrl(retour));
  }

  function startPolling(ref: string) {
    setPolling(true);
    if (pollRef.current) clearInterval(pollRef.current);
    let tries = 0;
    pollRef.current = setInterval(async () => {
      tries += 1;
      try {
        const res = await fetch(
          `/api/payments/status?ref=${encodeURIComponent(ref)}`,
        );
        const data = (await res.json()) as {
          approved?: boolean;
          rejected?: boolean;
          error?: string;
        };
        if (data.approved) {
          void finishSuccess();
          return;
        }
        if (data.rejected) {
          if (pollRef.current) clearInterval(pollRef.current);
          setPolling(false);
          setPaying(false);
          setError("Paiement refusé. Réessaie avec un autre numéro.");
        }
      } catch {
        /* ignore transient */
      }
      if (tries >= 40) {
        if (pollRef.current) clearInterval(pollRef.current);
        setPolling(false);
        setPaying(false);
        setError(
          "Délai dépassé. Si tu as confirmé sur ton téléphone, recharge ou réessaie.",
        );
      }
    }, 3000);
  }

  async function onPay() {
    setError(null);
    setPaying(true);

    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          operator,
          period,
          otpCode: needOtp ? otpCode : undefined,
          contexte,
          retour,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        externalRef?: string;
        transactionId?: string | null;
        otpRequired?: boolean;
        ussdCode?: string | null;
        status?: string;
        activated?: boolean;
        approved?: boolean;
      };

      if (!res.ok || !data.ok) {
        if (data.otpRequired || /otp/i.test(data.error ?? "")) {
          setNeedOtp(true);
          setError(
            "Cet opérateur demande un code OTP. Compose le USSD puis saisis le code.",
          );
        } else {
          setError(data.error ?? "Paiement impossible pour le moment.");
        }
        setPaying(false);
        return;
      }

      // Dev : le serveur active l’abo immédiatement.
      if (data.approved || data.activated || data.status === "approved") {
        await finishSuccess();
        return;
      }

      if (data.otpRequired && !otpCode) {
        setNeedOtp(true);
        setUssdCode(data.ussdCode ?? null);
        setExternalRef(data.externalRef ?? null);
        setError("Saisis le code OTP reçu / affiché, puis confirme.");
        setPaying(false);
        return;
      }

      // Toujours poller avec externalRef (contient l’user id — contrôle d’accès).
      const ref = data.externalRef || data.transactionId;
      if (!ref) {
        setError("Référence de transaction manquante.");
        setPaying(false);
        return;
      }

      setExternalRef(data.externalRef ?? ref);
      setUssdCode(data.ussdCode ?? null);
      startPolling(ref);
    } catch {
      setError("Erreur réseau. Vérifie ta connexion et réessaie.");
      setPaying(false);
    }
  }

  const field =
    "w-full rounded-2xl border border-[#ebebeb] bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400";

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-zinc-900">
      <div className="mx-auto max-w-lg px-4 pb-12 pt-2">
        <header className="relative mb-3 flex items-center justify-center">
          <Link
            href={backHref}
            aria-label="Retour"
            className="absolute left-0 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-bold text-zinc-900 shadow-sm"
          >
            ‹
          </Link>
          <h1 className="text-[15px] font-bold text-zinc-900">
            {isPublier ? "Publication" : "Abonnements"}
          </h1>
        </header>

        <div className="flex flex-col items-center text-center">
          <h2
            className={`text-[26px] font-bold leading-tight tracking-tight ${
              isPublier ? "text-[#e11d48]" : "text-zinc-900"
            }`}
          >
            {isPublier
              ? "Frais de publication de propriété"
              : "Abonnements Lopango"}
          </h2>
          <p
            className={`mt-2 max-w-sm text-[13px] leading-snug ${
              isPublier ? "text-[#e11d48]/80" : "text-zinc-500"
            }`}
          >
            {isPublier
              ? "L’État démolira ta maison. Pas parce qu’elle est illégale parce qu’un démarcheur l’a filmée et réclame des frais de visite. C’est ta maison qu’ils cassent. Pas lui. Publie-la toi-même sur Lopango. Avant qu’il le fasse."
              : "Tu cherches une maison dans tout le Congo ? Lopango change tout."}
          </p>
        </div>

        <div className="mx-auto mt-5 flex max-w-xs rounded-full bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => choosePeriod("mensuel")}
            className={`flex-1 rounded-full py-2 text-[13px] font-semibold transition-colors ${
              period === "mensuel" ? "bg-zinc-900 text-white" : "text-zinc-500"
            }`}
          >
            Mensuel
          </button>
          <button
            type="button"
            onClick={() => choosePeriod("annuel")}
            className={`flex-1 rounded-full py-2 text-[13px] font-semibold transition-colors ${
              period === "annuel" ? "bg-zinc-900 text-white" : "text-zinc-500"
            }`}
          >
            Annuel
          </button>
        </div>

        <div className="mt-5 overflow-hidden rounded-[1.75rem] border border-zinc-200 bg-white shadow-sm">
          <div className="bg-zinc-900 py-2.5 text-center text-[12px] font-semibold text-white">
            Le plus populaire ★
          </div>

          <div className="px-5 pb-5 pt-4">
            <div>
              <p className="text-[22px] font-bold leading-none text-zinc-900">
                Accès
              </p>
              <p className="mt-1.5 text-[13px] text-zinc-500">
                {isPublier
                  ? "Sécurise ton bien avant qu’un démarcheur le détruise."
                  : "Débloque les infos propriétaires partout au Congo"}
              </p>
            </div>

            <p className="mt-4 text-center text-[28px] font-bold tabular-nums tracking-tight text-zinc-900">
              {formatFcfa(price)}
              <span className="text-[14px] font-semibold text-zinc-500">
                {priceSuffix}
              </span>
            </p>
            {period === "annuel" && (
              <p className="mt-1 text-center text-[12px] text-zinc-500">
                Soit {formatFcfa(Math.round(PRICE_ANNUEL / 12))}/mois — valable
                dans tout le Congo
              </p>
            )}

            <ul className={`mt-5 ${isPublier ? "space-y-4" : "space-y-3"}`}>
              {argumentsList.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                      isPublier ? "bg-[#e11d48]" : "bg-zinc-900"
                    }`}
                  >
                    ✓
                  </span>
                  <span
                    className={
                      isPublier
                        ? "text-[14px] font-semibold leading-relaxed tracking-[-0.01em] text-zinc-900"
                        : "text-[13px] leading-snug text-zinc-700"
                    }
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-3 border-t border-[#ebebeb] pt-3">
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-zinc-500">
                  Opérateur
                </span>
                <SelectField
                  value={operator}
                  onChange={(e) =>
                    setOperator(
                      e.target.value as (typeof CONGO_OPERATORS)[number]["slug"],
                    )
                  }
                >
                  {CONGO_OPERATORS.map((op) => (
                    <option key={op.slug} value={op.slug}>
                      {op.label}
                    </option>
                  ))}
                </SelectField>
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-zinc-500">
                  Numéro Mobile Money
                </span>
                <input
                  type="tel"
                  className={field}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+242 06 000 00 00"
                />
              </label>
              {needOtp && (
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-zinc-500">
                    Code OTP
                  </span>
                  <input
                    className={field}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Code reçu / USSD"
                  />
                  {ussdCode && (
                    <p className="text-xs text-zinc-500">
                      Compose : <span className="font-semibold">{ussdCode}</span>
                    </p>
                  )}
                </label>
              )}
            </div>

            {error && (
              <p className="mt-3 rounded-2xl bg-red-50 px-3 py-2 text-center text-xs font-medium text-red-700">
                {error}
              </p>
            )}

            {polling && (
              <p className="mt-3 rounded-2xl bg-zinc-50 px-3 py-2 text-center text-xs font-medium text-zinc-600">
                En attente de confirmation sur ton téléphone…
                {externalRef ? (
                  <span className="mt-1 block font-mono text-[10px] text-zinc-400">
                    {externalRef}
                  </span>
                ) : null}
              </p>
            )}

            <button
              type="button"
              disabled={paying || polling}
              onClick={onPay}
              className="mt-6 w-full rounded-2xl bg-zinc-900 py-3.5 text-[15px] font-semibold text-white active:opacity-90 disabled:opacity-60"
            >
              {polling
                ? "Confirmation en cours…"
                : paying
                  ? "Envoi du paiement…"
                  : isPublier
                    ? `Je publie et protège pour ${formatFcfa(price)}`
                    : period === "mensuel"
                      ? `Débloquer pour ${formatFcfa(PRICE_MENSUEL)} le mois`
                      : `Débloquer pour ${formatFcfa(PRICE_ANNUEL)} l’an`}
            </button>

            <p className="mt-3 text-center text-[11px] leading-snug text-zinc-400">
              {process.env.NODE_ENV === "development"
                ? "Mode local : le paiement s’active immédiatement."
                : "Paiement sécurisé par Mobile Money · Congo"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaiementPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] text-sm text-zinc-500">
          Chargement…
        </div>
      }
    >
      <PaiementContent />
    </Suspense>
  );
}
