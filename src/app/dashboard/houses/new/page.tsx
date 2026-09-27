"use client";

import { SellerShell } from "@/components/seller/SellerShell";
import { HouseForm } from "@/components/seller/HouseForm";

export default function NewHousePage() {
  return (
    <SellerShell title="Publier une maison" backHref="/dashboard/houses">
      <HouseForm />
    </SellerShell>
  );
}