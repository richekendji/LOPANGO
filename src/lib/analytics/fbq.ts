declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Envoie un événement au Pixel Meta (s'il est chargé).
 * N'échoue pas si le pixel est absent (bloqueur de pub, noscript…).
 *
 * Événements standards Meta utilisés dans l'app :
 * - ViewContent        → fiche maison ouverte
 * - Search             → recherche dans le feed
 * - InitiateCheckout   → arrivée sur la page de paiement
 * - Purchase           → paiement confirmé
 * - Contact            → message envoyé à un propriétaire
 * - Lead               → maison publiée par un propriétaire
 */
export function fbqTrack(
  event: string,
  params?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  if (typeof window.fbq !== "function") return;
  try {
    window.fbq("track", event, params);
  } catch {
    /* le pixel ne doit jamais casser l'app */
  }
}

/** Devise CFA (Afrique centrale — Congo-Brazzaville). */
export const FBQ_CURRENCY = "XAF";
