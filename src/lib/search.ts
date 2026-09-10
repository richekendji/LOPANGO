import type { SellerHouse } from "@/lib/mock/houses";

/** Minuscules, sans accents, ponctuation → espaces. */
export function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function singularize(token: string): string {
  if (token.length <= 3) return token;
  if (token.endsWith("eaux")) return `${token.slice(0, -4)}eau`;
  if (token.endsWith("aux")) return `${token.slice(0, -3)}al`;
  if (token.endsWith("s")) return token.slice(0, -1);
  return token;
}

function pluralize(token: string): string {
  if (token.endsWith("s") || token.endsWith("x")) return token;
  if (token.endsWith("al")) return `${token.slice(0, -2)}aux`;
  if (token.endsWith("eau")) return `${token}x`;
  return `${token}s`;
}

/** Variantes utiles pour un mot (chambre ↔ chambres, etc.). */
function tokenVariants(token: string): string[] {
  const t = singularize(token);
  const set = new Set<string>([token, t, pluralize(t)]);

  const aliases: Record<string, string[]> = {
    chambre: ["chambres"],
    salon: ["salons"],
    cuisine: ["cuisines"],
    parking: ["parkings", "garage", "garages"],
    balcon: ["balcons"],
    terrasse: ["terrasses"],
    toilette: ["toilettes", "wc"],
    toilettes: ["toilette", "wc"],
    salle: ["salles", "sdb", "bain"],
    studio: ["studios"],
    villa: ["villas"],
    appartement: ["appartements", "appart", "apparts"],
    maison: ["maisons"],
  };

  for (const key of [token, t]) {
    const extra = aliases[key];
    if (extra) extra.forEach((a) => set.add(a));
  }

  return Array.from(set);
}

/** Index texte riche d’une annonce (ordres chiffre/libellé + variantes). */
export function buildHouseSearchIndex(house: SellerHouse): string {
  const parts: string[] = [
    house.title,
    house.description,
    house.city,
    house.neighborhood,
    house.address,
    house.houseType,
  ];

  for (const f of house.features) {
    const label = f.label.trim();
    const value = f.value.trim();
    if (!label && !value) continue;

    parts.push(label, value, `${label} ${value}`, `${value} ${label}`);

    const labelNorm = normalizeSearchText(label);
    const stem = singularize(labelNorm);
    const plur = pluralize(stem);
    if (value) {
      parts.push(
        `${value} ${stem}`,
        `${stem} ${value}`,
        `${value} ${plur}`,
        `${plur} ${value}`,
      );
    }
    parts.push(stem, plur);
  }

  return normalizeSearchText(parts.join(" "));
}

/**
 * Chaque mot de la requête doit matcher.
 * Ex. « 4 chambre salon » → 4 + chambre(s) + salon(s).
 */
export function houseMatchesQuery(house: SellerHouse, query: string): boolean {
  const tokens = normalizeSearchText(query)
    .split(" ")
    .filter(Boolean);

  if (tokens.length === 0) return true;

  const hay = buildHouseSearchIndex(house);

  return tokens.every((token) => {
    if (/^\d+$/.test(token)) {
      // Le chiffre doit apparaître comme token (évite "4" dans "450000" trop large…
      // mais on accepte aussi include pour prix/ids courts).
      const parts = hay.split(" ");
      if (parts.includes(token)) return true;
      // Accepte aussi "4chambres" collé après normalisation ratée
      return hay.includes(` ${token} `) || hay.startsWith(`${token} `) || hay.endsWith(` ${token}`);
    }

    return tokenVariants(token).some((v) => hay.includes(v));
  });
}
