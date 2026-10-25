import { NextRequest } from "next/server";
import { CANONICAL_INDICATORS } from "@/lib/data/registry";
import { getAllObservations } from "@/lib/db";
import {
  apiSuccess,
  apiError,
  IndicatorQuerySchema,
} from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      rawParams[key] = value;
    });

    const parsed = IndicatorQuerySchema.safeParse(rawParams);
    if (!parsed.success) {
      return apiError(
        "INVALID_QUERY_PARAMS",
        "Invalid query parameters for indicators",
        400,
        parsed.error.issues
      );
    }

    const { populationType, isStock, sourceId } = parsed.data;
    const observations = getAllObservations();

    // Map observation counts per indicator
    const countsByIndicator = new Map<string, number>();
    for (const obs of observations) {
      countsByIndicator.set(
        obs.indicatorId,
        (countsByIndicator.get(obs.indicatorId) || 0) + 1
      );
    }

    let filtered = CANONICAL_INDICATORS.map((ind) => ({
      ...ind,
      observationCount: countsByIndicator.get(ind.id) || 0,
    }));

    if (populationType) {
      filtered = filtered.filter((i) => i.populationType === populationType);
    }

    if (isStock !== undefined) {
      filtered = filtered.filter((i) => i.isStock === isStock);
    }

    if (sourceId) {
      filtered = filtered.filter((i) => i.defaultSourceId === sourceId);
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
