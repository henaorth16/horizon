import { NextRequest } from "next/server";
import { CANONICAL_LOCATIONS } from "@/lib/data/registry";
import { getAllObservations } from "@/lib/db";
import {
  apiSuccess,
  apiError,
  LocationQuerySchema,
} from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      rawParams[key] = value;
    });

    const parsed = LocationQuerySchema.safeParse(rawParams);
    if (!parsed.success) {
      return apiError(
        "INVALID_QUERY_PARAMS",
        "Invalid query parameters for locations",
        400,
        parsed.error.issues
      );
    }

    const { adminLevel, parentId, pcode, search } = parsed.data;
    const observations = getAllObservations();

    // Compute observation counts per location
    const countsByLocation = new Map<string, number>();
    for (const obs of observations) {
      countsByLocation.set(
        obs.locationId,
        (countsByLocation.get(obs.locationId) || 0) + 1
      );
    }

    let filtered = CANONICAL_LOCATIONS.map((loc) => ({
      ...loc,
      observationCount: countsByLocation.get(loc.pcode || loc.id) || 0,
    }));

    if (adminLevel !== undefined) {
      filtered = filtered.filter((l) => l.adminLevel === adminLevel);
    }

    if (parentId) {
      filtered = filtered.filter((l) => l.parentId === parentId);
    }

    if (pcode) {
      filtered = filtered.filter((l) => l.pcode === pcode || l.id === pcode);
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          (l.pcode && l.pcode.toLowerCase().includes(q)) ||
          l.altNames.some((alt) => alt.toLowerCase().includes(q))
      );
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
