import { z } from "zod";
import type { ValidatedObservation } from "@/lib/contracts/observations";

/**
 * UNHCR Population API Raw Item Schema
 */
export const UnhcrPopulationItemSchema = z.object({
  year: z.number(),
  coa_name: z.string().optional(),
  coa: z.string().optional(),
  coa_iso: z.string().optional(),
  coo_name: z.string().optional(),
  coo: z.string().optional(),
  coo_iso: z.string().optional(),
  refugees: z.union([z.number(), z.string()]).transform((val) => (typeof val === "string" ? parseInt(val, 10) || 0 : val)),
  asylum_seekers: z.union([z.number(), z.string()]).transform((val) => (typeof val === "string" ? parseInt(val, 10) || 0 : val)),
  returned_refugees: z.union([z.number(), z.string()]).transform((val) => (typeof val === "string" ? parseInt(val, 10) || 0 : val)),
  idps: z.union([z.number(), z.string()]).transform((val) => (typeof val === "string" ? parseInt(val, 10) || 0 : val)),
  returned_idps: z.union([z.number(), z.string()]).transform((val) => (typeof val === "string" ? parseInt(val, 10) || 0 : val)),
});

export const UnhcrResponseSchema = z.object({
  page: z.number(),
  items: z.array(UnhcrPopulationItemSchema),
});

export type UnhcrPopulationItem = z.infer<typeof UnhcrPopulationItemSchema>;

const BASE_URL = "https://api.unhcr.org/population/v1";

export interface FetchUnhcrOptions {
  year?: number;
  countryOfAsylum?: string; // e.g. "ETH"
  countryOfOrigin?: string; // e.g. "ETH"
  limit?: number;
  fetchFn?: typeof fetch;
  signal?: AbortSignal;
  timeoutMs?: number;
  fallbackObservations?: ValidatedObservation[];
}

/**
 * Fetches verified population figures from the official UNHCR Refugee Data Finder API.
 */
export async function fetchUnhcrPopulation(
  options: FetchUnhcrOptions = {}
): Promise<{
  rawItems: UnhcrPopulationItem[];
  observations: ValidatedObservation[];
  usedFallback?: boolean;
}> {
  const {
    year = 2023,
    countryOfAsylum = "ETH",
    countryOfOrigin,
    limit = 10,
    fetchFn = fetch,
    signal,
    timeoutMs,
    fallbackObservations,
  } = options;

  let timer: ReturnType<typeof setTimeout> | undefined;
  let activeSignal = signal;

  if (timeoutMs && !activeSignal && typeof AbortController !== "undefined") {
    const controller = new AbortController();
    activeSignal = controller.signal;
    timer = setTimeout(() => {
      controller.abort(new Error(`UNHCR API request timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  }

  try {
    const url = new URL(`${BASE_URL}/population/`);
    url.searchParams.set("year", year.toString());
    url.searchParams.set("limit", limit.toString());
    if (countryOfAsylum) url.searchParams.set("coa", countryOfAsylum);
    if (countryOfOrigin) url.searchParams.set("coo", countryOfOrigin);

    const response = await fetchFn(url.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent": "EthiopiaMigrationObservatory/1.0 (Research & Monitoring)",
      },
      signal: activeSignal,
      // Cache for 24 hours in Next.js fetch cache if supported
      next: { revalidate: 86400 },
    } as RequestInit);

    if (!response.ok) {
      throw new Error(`UNHCR API error: HTTP ${response.status} ${response.statusText}`);
    }

    let json: unknown;
    try {
      json = await response.json();
    } catch (parseErr) {
      throw new Error(
        `UNHCR API returned malformed JSON: ${
          parseErr instanceof Error ? parseErr.message : String(parseErr)
        }`
      );
    }

    const parsed = UnhcrResponseSchema.safeParse(json);

    if (!parsed.success) {
      throw new Error(`UNHCR API payload validation failed: ${parsed.error.message}`);
    }

    const retrievalDate = new Date().toISOString();
    const observations: ValidatedObservation[] = [];

    for (const item of parsed.data.items) {
    const locId = item.coa_iso && item.coa_iso !== "-" ? item.coa_iso : "ET";

    // Refugee observation
    if (item.refugees > 0) {
      observations.push({
        id: `unhcr_refugees_${item.year}_${locId}`,
        indicatorId: "refugee_stock",
        locationId: locId,
        value: item.refugees,
        reportingDate: `${item.year}-12-31`,
        referencePeriodType: "year",
        retrievalDate,
        sourceId: "unhcr",
        populationType: "refugee",
        confidence: "high",
        notes: `Registered refugee population in ${item.coa_name || "Ethiopia"}`,
      });
    }

    // Asylum Seekers observation
    if (item.asylum_seekers > 0) {
      observations.push({
        id: `unhcr_asylum_${item.year}_${locId}`,
        indicatorId: "asylum_seeker_stock",
        locationId: locId,
        value: item.asylum_seekers,
        reportingDate: `${item.year}-12-31`,
        referencePeriodType: "year",
        retrievalDate,
        sourceId: "unhcr",
        populationType: "asylum_seeker",
        confidence: "high",
        notes: `Pending individual asylum applications in ${item.coa_name || "Ethiopia"}`,
      });
    }
  }

    return {
      rawItems: parsed.data.items,
      observations,
    };
  } catch (err: unknown) {
    if (fallbackObservations) {
      return {
        rawItems: [],
        observations: fallbackObservations,
        usedFallback: true,
      };
    }
    throw err;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
