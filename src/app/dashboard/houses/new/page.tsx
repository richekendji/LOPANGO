"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SellerShell } from "@/components/seller/SellerShell";
import { HouseForm } from "@/components/seller/HouseForm";
import {
  hasActiveSubscription,
  refreshSubscriptionStatus,
} from "@/lib/mock/store";

const PAY_URL =
  "/paiement?contexte=publier&retour=" +
  encodeURIComponent("/dashboard/houses/new");

export default function NewHousePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [active, bypass] = await Promise.all([
        refreshSubscriptionStatus(),
        fetch("/api/agent/me", { cache: "no-store" })
          .then(
            (r) =>
              r.ok
                ? (r.json() as Promise<{ agent?: boolean; admin?: boolean }>)
                : null,
          )
          .then(
            (d) =>
              Boolean(d?.agent) || Boolean(d?.admin),
          )
          .catch(() => false),
      ]);
      if (cancelled) return;
      // Démarcheurs et admin publient gratuitement.
      if (!active && !bypass) {
        router.replace(PAY_URL);
        setReady(true);
        return;
      }
      setAllowed(true);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready || (!allowed && !hasActiveSubscription())) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-[#f5f5f5] text-sm text-zinc-500">
        Vérification de l’abonnement…
      </div>
    );
  }

  return (
    <SellerShell title="Publier une maison" backHref="/dashboard/houses">
      <HouseForm />
    </SellerShell>
  );
}
