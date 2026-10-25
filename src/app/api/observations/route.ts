import { NextRequest } from "next/server";
import { queryObservations, getObservationById } from "@/lib/db";
import {
  apiSuccess,
  apiError,
  ObservationQuerySchema,
} from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Convert search params into a key-value object
    const rawParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      rawParams[key] = value;
    });

    const parsed = ObservationQuerySchema.safeParse(rawParams);
    if (!parsed.success) {
      return apiError(
        "INVALID_QUERY_PARAMS",
        "Invalid query parameters provided",
        400,
        parsed.error.issues
      );
    }

    const {
      id,
      locationId,
      populationType,
      indicatorId,
      sourceId,
      driver,
      startDate,
      endDate,
      sortBy,
      sortDirection,
      limit,
      offset,
    } = parsed.data;

    // Single item lookup by unique ID
    if (id) {
      const single = getObservationById(id);
      if (!single) {
        return apiError("NOT_FOUND", `Observation with id "${id}" not found`, 404);
      }
      return apiSuccess(single, {
        total: 1,
        limit: 1,
        offset: 0,
        hasMore: false,
      });
    }

    const result = queryObservations({
      locationId,
      populationType,
      indicatorId,
      sourceId,
      driver,
      minReportingDate: startDate,
      maxReportingDate: endDate,
      sortBy,
      sortDirection,
      limit,
      offset,
    });

    const hasMore = offset + limit < result.total;

    return apiSuccess(result.data, {
      total: result.total,
      limit,
      offset,
      hasMore,
      params: {
        locationId,
        populationType,
        indicatorId,
        sourceId,
        driver,
        startDate,
        endDate,
        sortBy,
        sortDirection,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return apiError("SERVER_ERROR", message, 500);
  }
}
