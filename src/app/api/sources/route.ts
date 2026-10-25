import { NextRequest } from "next/server";
import { CANONICAL_SOURCES } from "@/lib/data/registry";
import { getAllObservations } from "@/lib/db";
import {
  apiSuccess,
  apiError,
  SourceQuerySchema,
} from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      rawParams[key] = value;
    });

    const parsed = SourceQuerySchema.safeParse(rawParams);
    if (!parsed.success) {
      return apiError(
        "INVALID_QUERY_PARAMS",
        "Invalid query parameters for sources",
        400,
        parsed.error.issues
      );
    }

    const { active } = parsed.data;
    const observations = getAllObservations();

    // Compute observation counts per source
    const countsBySource = new Map<string, number>();
    for (const obs of observations) {
      countsBySource.set(
        obs.sourceId,
        (countsBySource.get(obs.sourceId) || 0) + 1
      );
    }

    let filtered = CANONICAL_SOURCES.map((src) => ({
      ...src,
      observationCount: countsBySource.get(src.id) || 0,
    }));

    if (active !== undefined) {
      filtered = filtered.filter((s) => s.active === active);
    }

    return apiSuccess(filtered, {
      total: filtered.length,
      limit: filtered.length,
      offset: 0,
      hasMore: false,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return apiError("SERVER_ERROR", message, 500);
  }
}
