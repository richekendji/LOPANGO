import { SEED_HOUSES, type SellerHouse } from "@/lib/mock/houses";

/**
 * Lecture d'une annonce par les server components.
 * Les annonces créées par les vendeurs vivent dans le localStorage du
 * navigateur (mock store) : côté serveur on lit le SEED uniquement.
 */
export function getMockHouse(id: string): SellerHouse | null {
  return SEED_HOUSES.find((h) => h.id === id) ?? null;
}
