import { z } from "zod";

export const HdxResourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  format: z.string(),
  url: z.string().url(),
  created: z.string().optional(),
  last_modified: z.string().nullable().optional(),
  size: z.number().nullable().optional(),
});

export const HdxPackageSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string(),
  dataset_date: z.string().nullable().optional(),
  organization: z
    .object({
      title: z.string().optional(),
      name: z.string().optional(),
    })
    .optional(),
  resources: z.array(HdxResourceSchema),
});

export const HdxSearchResponseSchema = z.object({
  success: z.boolean(),
  result: z.object({
    count: z.number(),
    results: z.array(HdxPackageSchema),
  }),
});

export type HdxPackage = z.infer<typeof HdxPackageSchema>;
export type HdxResource = z.infer<typeof HdxResourceSchema>;

const HDX_API_BASE = "https://data.humdata.org/api/3/action";

export interface HdxSearchOptions {
  query: string;
  rows?: number;
  fetchFn?: typeof fetch;
  signal?: AbortSignal;
  timeoutMs?: number;
  fallbackPackages?: HdxPackage[];
}

/**
 * Searches HDX for humanitarian datasets and retrieves downloadable resources.
 */
export async function searchHdxPackages(
  options: HdxSearchOptions
): Promise<{ count: number; packages: HdxPackage[]; usedFallback?: boolean }> {
  const { query, rows = 5, fetchFn = fetch, signal, timeoutMs, fallbackPackages } = options;

  let timer: ReturnType<typeof setTimeout> | undefined;
  let activeSignal = signal;

  if (timeoutMs && !activeSignal && typeof AbortController !== "undefined") {
    const controller = new AbortController();
    activeSignal = controller.signal;
    timer = setTimeout(() => {
      controller.abort(new Error(`HDX API request timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  }

  try {
    const url = new URL(`${HDX_API_BASE}/package_search`);
    url.searchParams.set("q", query);
    url.searchParams.set("rows", rows.toString());

    const response = await fetchFn(url.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent": "EthiopiaMigrationObservatory/1.0 (HDX Ingestion Client)",
      },
      signal: activeSignal,
      next: { revalidate: 86400 },
    } as RequestInit);

    if (!response.ok) {
      throw new Error(`HDX CKAN API error: HTTP ${response.status} ${response.statusText}`);
    }

    let json: unknown;
    try {
      json = await response.json();
    } catch (parseErr) {
      throw new Error(
        `HDX API returned malformed JSON: ${
          parseErr instanceof Error ? parseErr.message : String(parseErr)
        }`
      );
    }

    const parsed = HdxSearchResponseSchema.safeParse(json);

    if (!parsed.success) {
      throw new Error(`HDX API payload validation failed: ${parsed.error.message}`);
    }

    return {
      count: parsed.data.result.count,
      packages: parsed.data.result.results,
    };
  } catch (err: unknown) {
    if (fallbackPackages) {
      return {
        count: fallbackPackages.length,
        packages: fallbackPackages,
        usedFallback: true,
      };
    }
    throw err;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
