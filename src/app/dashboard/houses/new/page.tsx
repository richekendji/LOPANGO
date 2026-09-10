"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SellerShell } from "@/components/seller/SellerShell";
import { HouseForm } from "@/components/seller/HouseForm";
import { hasActiveSubscription } from "@/lib/mock/store";

const PAY_URL =
  "/paiement?contexte=publier&retour=" +
  encodeURIComponent("/dashboard/houses/new");

export default function NewHousePage() {
  const router = useRouter();

  useEffect(() => {
    if (!hasActiveSubscription()) {
      router.replace(PAY_URL);
    }
  }, [router]);

  if (!hasActiveSubscription()) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-[#f5f5f5] text-sm text-zinc-500">
        Redirection vers l’abonnement…
      </div>
    );
  }

  return (
    <SellerShell title="Publier une maison" backHref="/dashboard/houses">
      <HouseForm />
    </SellerShell>
  );
}
