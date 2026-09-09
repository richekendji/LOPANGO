import { randomInt } from "node:crypto";

/**
 * Génération des identifiants "un clic" LOPANGO.
 * L'identifiant sert aussi d'email technique côté Supabase
 * (identifiant@lopango.local), ce qui permet la connexion par
 * identifiant sans stockage supplémentaire.
 */

const ACCENTS: Record<string, string> = {
  à: "a", â: "a", ä: "a", á: "a", ã: "a",
  é: "e", è: "e", ê: "e", ë: "e",
  î: "i", ï: "i", í: "i",
  ô: "o", ö: "o", ó: "o",
  ù: "u", û: "u", ü: "u", ú: "u",
  ç: "c", ñ: "n", œ: "oe", æ: "ae",
};

/** Nettoie une partie de nom : minuscules, sans accents, alphanumérique uniquement. */
export function slugifyPart(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[àâäáãéèêëîïíôöóùûüúçñœæ]/g, (c) => ACCENTS[c] ?? c)
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 12);
}

function randomDigits(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += randomInt(0, 10).toString();
  }
  return out;
}

function randomLetters(length: number): string {
  // Sans "l" ni "o" pour éviter la confusion avec 1 et 0
  const alphabet = "abcdefghijkmnpqrstuvwxyz";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[randomInt(0, alphabet.length)];
  }
  return out;
}

/** ex : jean.dupont4821 */
export function generateIdentifier(firstName: string, lastName: string): string {
  const first = slugifyPart(firstName);
  const last = slugifyPart(lastName);
  const base = [first, last].filter(Boolean).join(".") || "membre";
  return `${base}${randomDigits(4)}`;
}

/** ex : LPkxmjq427 — préfixe lisible + facile à recopier */
export function generatePassword(): string {
  return `LP${randomLetters(5)}${randomDigits(3)}`;
}

/** Email technique dérivé de l'identifiant (jamais montré à l'utilisateur). */
export function identifierToEmail(identifier: string): string {
  return `${slugifyPart(identifier.replace(/\./g, ""))}@lopango.local`;
}

/** Normalise une saisie d'identifiant : minuscules, sans espaces. */
export function normalizeIdentifier(input: string): string {
  return input.toLowerCase().trim().replace(/\s+/g, "");
}
