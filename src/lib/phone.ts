/** Préfixe Mobile Money Congo : 06 (MTN), 05 (Airtel) ou 04. */
export type PhonePrefix = "06" | "05" | "04";

export const PHONE_PREFIXES: PhonePrefix[] = ["06", "05", "04"];

/** Digits only, ex: 061234567 */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Formate la partie locale (7 chiffres) en "123 45 67".
 */
export function formatLocalPart(digits: string): string {
  const d = digitsOnly(digits).slice(0, 7);
  const a = d.slice(0, 3);
  const b = d.slice(3, 5);
  const c = d.slice(5, 7);
  return [a, b, c].filter(Boolean).join(" ");
}

/** Affichage complet : "06 123 45 67" */
export function formatPhoneDisplay(prefix: PhonePrefix, localDigits: string): string {
  const local = formatLocalPart(localDigits);
  return local ? `${prefix} ${local}` : prefix;
}

/**
 * Normalise une saisie quelconque vers 9 chiffres (06/05/04 + 7).
 * Accepte "06 123 45 67", "061234567", "+242061234567", etc.
 */
export function normalizePhone(input: string): string | null {
  let d = digitsOnly(input);
  if (d.startsWith("242") && d.length >= 12) {
    d = d.slice(3);
  }
  if (
    d.length === 9 &&
    (d.startsWith("06") || d.startsWith("05") || d.startsWith("04"))
  ) {
    return d;
  }
  return null;
}

export function parsePhoneParts(input: string): {
  prefix: PhonePrefix;
  local: string;
} | null {
  const n = normalizePhone(input);
  if (!n) return null;
  return {
    prefix: n.slice(0, 2) as PhonePrefix,
    local: n.slice(2),
  };
}

export function isValidPhone(input: string): boolean {
  return normalizePhone(input) !== null;
}

/** Affiche un numéro déjà normalisé : 061234567 → "06 123 45 67" */
export function displayNormalizedPhone(normalized: string): string {
  const parts = parsePhoneParts(normalized);
  if (!parts) return normalized;
  return formatPhoneDisplay(parts.prefix, parts.local);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

/** Email technique Supabase dérivé du numéro (jamais montré à l'utilisateur). */
export function phoneToAuthEmail(phone: string): string {
  return `${phone}@lopango.local`;
}
