import type { PopulationType } from "@/lib/contracts";

/**
 * Normalized Population Category Crosswalk
 */
export const POPULATION_TAXONOMY_MAP: Record<string, PopulationType> = {
  // IDPs
  "idp": "idp",
  "idps": "idp",
  "internally displaced": "idp",
  "internally displaced persons": "idp",
  "internal displacement": "idp",
  "sa_idp": "idp",

  // Refugees
  "refugee": "refugee",
  "refugees": "refugee",
  "ref": "refugee",
  "registered_refugees": "refugee",
  "mandate_refugees": "refugee",

  // Asylum Seekers
  "asylum_seeker": "asylum_seeker",
  "asylum seekers": "asylum_seeker",
  "asylum-seekers": "asylum_seeker",
  "asy": "asylum_seeker",
  "pending_asylum": "asylum_seeker",

  // Returnees
  "returnee": "returnee",
  "returnees": "returnee",
  "idp_returnees": "returnee",
  "returned_refugees": "returnee",
  "returned_idps": "returnee",
  "ret": "returnee",

  // International Migrants
  "international_migrant": "international_migrant",
  "international migrants": "international_migrant",
  "migrant_stock": "international_migrant",
  "foreign_born": "international_migrant",
  "mig": "international_migrant",

  // Mixed Flow
  "mixed_flow": "mixed_flow",
  "transit_migrants": "mixed_flow",
  "cross_border_movers": "mixed_flow",

  // Host Community
  "host_community": "host_community",
  "host": "host_community",
  "hst": "host_community",
};

/**
 * Normalizes an arbitrary population string from external datasets into canonical PopulationType.
 */
export function normalizePopulationType(raw: string | null | undefined): PopulationType {
  if (!raw) return "idp";
  const normalizedKey = raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return POPULATION_TAXONOMY_MAP[normalizedKey] || POPULATION_TAXONOMY_MAP[raw.trim().toLowerCase()] || "idp";
}

/**
 * Determines whether two population categories can be mathematically added.
 * In humanitarian governance, IDPs and Refugees must NEVER be summed.
 */
export function arePopulationsAdditive(a: PopulationType, b: PopulationType): boolean {
  if (a === b) return true;
  // None of the major groups can be added across mandates
  return false;
}
