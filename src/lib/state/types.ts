/**
 * Unified Client State Model & Invalidation Guards
 * Manages cross-filtering between maps, timeline scrubbers, demographic charts, and detail sidebars.
 * Enforces strict comparative validation rules to prevent invalid aggregate calculations.
 */

export type PopulationFilter = "all" | "idp" | "refugee" | "returnee";
export type MetricFilter = "idps" | "returnees" | "refugees";
export type DriverFilter = "all" | "conflict" | "drought" | "floods" | "other";
export type RoundFilter = "R37" | "R34" | "R31" | "R28" | "R26";

export interface ObservatoryFilterState {
  region: string; // "all" | "ET01" | "ET02" | ...
  metric: MetricFilter;
  driver: DriverFilter;
  population: PopulationFilter;
  round: RoundFilter;
  adminLevel: 1 | 2;
}

export const DEFAULT_FILTER_STATE: ObservatoryFilterState = {
  region: "all",
  metric: "idps",
  driver: "all",
  population: "all",
  round: "R37",
  adminLevel: 1,
};

export const VALID_ROUNDS: RoundFilter[] = ["R37", "R34", "R31", "R28", "R26"];
export const VALID_POPULATIONS: PopulationFilter[] = ["all", "idp", "refugee", "returnee"];
export const VALID_METRICS: MetricFilter[] = ["idps", "returnees", "refugees"];
export const VALID_DRIVERS: DriverFilter[] = ["all", "conflict", "drought", "floods", "other"];

export const VALID_REGION_PCODES = new Set([
  "all",
  "ET",
  "ET01", // Tigray
  "ET02", // Afar
  "ET03", // Amhara
  "ET04", // Oromia
  "ET05", // Somali
  "ET06", // Benishangul-Gumuz
  "ET07", // SNNP / Southern
  "ET10", // Sidama
  "ET12", // Gambela
  "ET13", // Harari
  "ET14", // Addis Ababa
  "ET15", // Dire Dawa
]);

export interface ValidationIssue {
  parameter: string;
  originalValue: string;
  sanitizedValue: string;
  reason: string;
}

export interface SanitizedFilterResult {
  state: ObservatoryFilterState;
  issues: ValidationIssue[];
  hasInvalidCombination: boolean;
}

/**
 * Validates and sanitizes arbitrary input parameters, preventing invalid comparative calculations:
 * 1. Mandate Isolation: Refugee population cannot be filtered by internal IDP drivers (drought/floods).
 * 2. Mandate Isolation: Returnee metric cannot be combined with refugee population cohort.
 * 3. Geographic Bounds: Rejects invalid or hallucinated P-codes.
 * 4. Temporal Validity: Rejects unmonitored assessment rounds.
 */
export function sanitizeFilterState(
  raw: Partial<Record<keyof ObservatoryFilterState, unknown>>
): SanitizedFilterResult {
  const issues: ValidationIssue[] = [];
  const state: ObservatoryFilterState = { ...DEFAULT_FILTER_STATE };

  // 1. Sanitize Region
  if (typeof raw.region === "string") {
    const reg = raw.region.trim();
    if (VALID_REGION_PCODES.has(reg)) {
      state.region = reg;
    } else {
      issues.push({
        parameter: "region",
        originalValue: reg,
        sanitizedValue: "all",
        reason: `Region code "${reg}" is not recognized in official UN OCHA gazetteer. Reset to "all".`,
      });
      state.region = "all";
    }
  }

  // 2. Sanitize Metric
  if (typeof raw.metric === "string" && VALID_METRICS.includes(raw.metric as MetricFilter)) {
    state.metric = raw.metric as MetricFilter;
  }

  // 3. Sanitize Population
  if (typeof raw.population === "string" && VALID_POPULATIONS.includes(raw.population as PopulationFilter)) {
    state.population = raw.population as PopulationFilter;
  }

  // 4. Sanitize Driver
  if (typeof raw.driver === "string" && VALID_DRIVERS.includes(raw.driver as DriverFilter)) {
    state.driver = raw.driver as DriverFilter;
  }

  // 5. Sanitize Round
  if (typeof raw.round === "string" && VALID_ROUNDS.includes(raw.round as RoundFilter)) {
    state.round = raw.round as RoundFilter;
  } else if (raw.round) {
    issues.push({
      parameter: "round",
      originalValue: String(raw.round),
      sanitizedValue: "R37",
      reason: `Round "${raw.round}" is not in verified assessment schedule. Defaulted to latest Round 37.`,
    });
  }

  // 6. Sanitize AdminLevel
  if (raw.adminLevel === 1 || raw.adminLevel === 2 || raw.adminLevel === "1" || raw.adminLevel === "2") {
    state.adminLevel = Number(raw.adminLevel) as 1 | 2;
  }

  // --- MANDATE & COMPARATIVE INCOMPATIBILITY GUARDS ---

  // Rule A: If population is refugee, metric cannot be returnees (IOM returnee assessments monitor IDPs)
  if (state.population === "refugee" && state.metric === "returnees") {
    issues.push({
      parameter: "metric",
      originalValue: "returnees",
      sanitizedValue: "refugees",
      reason: "Refugees (UNHCR 1951 Convention) cannot be combined with IDP village return figures.",
    });
    state.metric = "refugees";
  }

  // Rule B: If population is refugee, climate driver cannot be combined (UNHCR doesn't classify refugees by internal Ethiopian drought)
  if (state.population === "refugee" && (state.driver === "drought" || state.driver === "floods")) {
    issues.push({
      parameter: "driver",
      originalValue: state.driver,
      sanitizedValue: "all",
      reason: "Refugee registration records do not classify individuals by subnational Ethiopian climate drivers.",
    });
    state.driver = "all";
  }

  // Rule C: If metric is refugees, population must be refugee
  if (state.metric === "refugees" && state.population === "idp") {
    issues.push({
      parameter: "population",
      originalValue: "idp",
      sanitizedValue: "refugee",
      reason: "IDP population cohort cannot be queried under refugee metric.",
    });
    state.population = "refugee";
  }

  return {
    state,
    issues,
    hasInvalidCombination: issues.length > 0,
  };
}

/**
 * Converts state object into clean URLSearchParams string.
 * Omits default parameters to keep URLs concise and shareable.
 */
export function filtersToQueryString(state: ObservatoryFilterState): string {
  const params = new URLSearchParams();

  if (state.region !== DEFAULT_FILTER_STATE.region) params.set("region", state.region);
  if (state.metric !== DEFAULT_FILTER_STATE.metric) params.set("metric", state.metric);
  if (state.driver !== DEFAULT_FILTER_STATE.driver) params.set("driver", state.driver);
  if (state.population !== DEFAULT_FILTER_STATE.population) params.set("population", state.population);
  if (state.round !== DEFAULT_FILTER_STATE.round) params.set("round", state.round);
  if (state.adminLevel !== DEFAULT_FILTER_STATE.adminLevel) params.set("level", String(state.adminLevel));

  const str = params.toString();
  return str ? `?${str}` : "";
}

/**
 * Parses URL query parameters into validated filter state.
 */
export function parseQueryStringToFilters(
  searchParams: URLSearchParams | Record<string, string>
): SanitizedFilterResult {
  const raw: Record<string, string> = {};

  if (searchParams instanceof URLSearchParams) {
    searchParams.forEach((val, key) => {
      raw[key] = val;
    });
  } else {
    Object.assign(raw, searchParams);
  }

  return sanitizeFilterState({
    region: raw.region,
    metric: raw.metric,
    driver: raw.driver,
    population: raw.population,
    round: raw.round,
    adminLevel: raw.level ? Number(raw.level) : undefined,
  });
}
