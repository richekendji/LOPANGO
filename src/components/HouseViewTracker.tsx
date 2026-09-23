"use client";

import { useEffect } from "react";
import type { SellerHouse } from "@/lib/mock/houses";
import { fbqTrack } from "@/lib/analytics/fbq";

/** Pixel Meta ViewContent — fiche maison consultée (accès débloqué). */
export default function HouseViewTracker({ house }: { house: SellerHouse }) {
  useEffect(() => {
    fbqTrack("ViewContent", {
      content_name: house.title,
      content_type: "product",
      content_ids: [house.id],
      value: house.price,
      currency: "XAF",
      city: house.city,
    });
    // Une seule fois par montage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [house.id]);

  return null;
}
