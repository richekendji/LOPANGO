"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ROUTES = ["/login", "/register", "/app", "/forgot-password"];

/** Précharge les pages auth dès l’arrivée sur le landing. */
export function LandingPrefetch() {
  const router = useRouter();

  useEffect(() => {
    for (const href of ROUTES) {
      try {
        router.prefetch(href);
      } catch {
        /* ignore */
      }
    }
  }, [router]);

  return null;
}
