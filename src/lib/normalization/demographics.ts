/**
 * Demographic Normalization Crosswalk
 */

export type NormalizedSex = "female" | "male" | "unspecified";

export const SEX_MAP: Record<string, NormalizedSex> = {
  "f": "female",
  "female": "female",
  "females": "female",
  "women": "female",
  "girls": "female",

  "m": "male",
  "male": "male",
  "males": "male",
  "men": "male",
  "boys": "male",

  "u": "unspecified",
  "unknown": "unspecified",
  "unspecified": "unspecified",
  "other": "unspecified",
};

export function normalizeSex(raw: string | null | undefined): NormalizedSex {
  if (!raw) return "unspecified";
  const clean = raw.trim().toLowerCase();
  return SEX_MAP[clean] || "unspecified";
}

/**
 * Standard UNHCR & IOM DTM Age Bracket Cohorts
 */
export const STANDARD_AGE_BRACKETS = [
  "0-4",
  "5-11",
  "12-17",
  "18-59",
  "60+",
] as const;

export type StandardAgeBracket = (typeof STANDARD_AGE_BRACKETS)[number] | "other";

export function normalizeAgeBracket(raw: string | null | undefined): string {
  if (!raw) return "unspecified";
  const clean = raw.trim().toLowerCase().replace(/\s+/g, "");

  if (["0-4", "0-5", "under5", "<5"].includes(clean)) return "0-4";
  if (["5-11", "5-12", "primary"].includes(clean)) return "5-11";
  if (["12-17", "13-17", "adolescent", "secondary"].includes(clean)) return "12-17";
  if (["18-59", "18-64", "adult", "working_age"].includes(clean)) return "18-59";
  if (["60+", "65+", "elderly", "60_plus"].includes(clean)) return "60+";

  return raw.trim(); // Preserve original bracket string if non-standard
}

export type NormalizedDriver =
  | "conflict"
  | "drought"
  | "floods"
  | "seasonal_pastoral"
  | "other"
  | "unspecified";

export const DRIVER_MAP: Record<string, NormalizedDriver> = {
  "conflict": "conflict",
  "violence": "conflict",
  "intercommunal": "conflict",
  "insecurity": "conflict",
  "war": "conflict",

  "drought": "drought",
  "water_shortage": "drought",
  "dry_spell": "drought",

  "flood": "floods",
  "floods": "floods",
  "flash_floods": "floods",
  "riverine_floods": "floods",

  "pastoral": "seasonal_pastoral",
  "seasonal": "seasonal_pastoral",
  "seasonal_pastoral": "seasonal_pastoral",

  "other": "other",
  "unknown": "unspecified",
  "unspecified": "unspecified",
};

export function normalizeDriver(raw: string | null | undefined): NormalizedDriver {
  if (!raw) return "unspecified";
  const clean = raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (DRIVER_MAP[clean]) return DRIVER_MAP[clean];
  if (clean.includes("conflict") || clean.includes("violence") || clean.includes("insecurity")) return "conflict";
  if (clean.includes("drought") || clean.includes("dry")) return "drought";
  if (clean.includes("flood")) return "floods";
  if (clean.includes("pastoral") || clean.includes("seasonal")) return "seasonal_pastoral";
  return "other";
}
