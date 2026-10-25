import { NextResponse } from "next/server";
import { z } from "zod";

export interface ApiMeta {
  total?: number;
  limit?: number;
  offset?: number;
  hasMore?: boolean;
  cachedAt?: string;
  params?: Record<string, unknown>;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: ApiMeta;
  error?: ApiError;
}

/**
 * Standard HTTP Cache-Control headers for Observatory endpoints.
 */
export const CACHE_HEADERS = {
  // 1 hour fresh in shared CDN/Edge caches, serve stale up to 24 hours while revalidating
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
  "CDN-Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
};

export const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
};

/**
 * Creates a standardized successful API response.
 */
export function apiSuccess<T>(
  data: T,
  meta?: ApiMeta,
  init?: { status?: number; headers?: HeadersInit; cache?: boolean }
): NextResponse<ApiResponse<T>> {
  const headers = new Headers(init?.headers);
  if (init?.cache !== false) {
    Object.entries(CACHE_HEADERS).forEach(([k, v]) => headers.set(k, v));
  } else {
    Object.entries(NO_CACHE_HEADERS).forEach(([k, v]) => headers.set(k, v));
  }

  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta ? { meta } : {}),
    },
    {
      status: init?.status ?? 200,
      headers,
    }
  );
}

/**
 * Creates a standardized error API response.
 */
export function apiError(
  code: string,
  message: string,
  status: number = 400,
  details?: unknown
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    },
    {
      status,
      headers: NO_CACHE_HEADERS,
    }
  );
}

/**
 * Zod schema for standard observation queries.
 */
export const ObservationQuerySchema = z.object({
  id: z.string().optional(),
  locationId: z.string().optional(),
  populationType: z
    .enum(["idp", "refugee", "returnee", "asylum_seeker", "international_migrant"])
    .optional(),
  indicatorId: z.string().optional(),
  sourceId: z.string().optional(),
  driver: z
    .enum(["conflict", "drought", "floods", "seasonal_pastoral", "other", "unspecified"])
    .optional(),
  startDate: z
    .string()
    .regex(/^\d{4}(-\d{2})?(-\d{2})?$/, "startDate must be YYYY, YYYY-MM, or YYYY-MM-DD")
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}(-\d{2})?(-\d{2})?$/, "endDate must be YYYY, YYYY-MM, or YYYY-MM-DD")
    .optional(),
  sortBy: z.enum(["value", "reportingDate", "locationId"]).default("value"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
  limit: z.coerce.number().int().min(1).max(500).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type ObservationQueryParams = z.infer<typeof ObservationQuerySchema>;

/**
 * Zod schema for indicator queries.
 */
export const IndicatorQuerySchema = z.object({
  populationType: z
    .enum(["idp", "refugee", "returnee", "asylum_seeker", "international_migrant"])
    .optional(),
  isStock: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  sourceId: z.string().optional(),
});

export type IndicatorQueryParams = z.infer<typeof IndicatorQuerySchema>;

/**
 * Zod schema for location queries.
 */
export const LocationQuerySchema = z.object({
  adminLevel: z.coerce.number().int().min(0).max(3).optional(),
  parentId: z.string().optional(),
  pcode: z.string().optional(),
  search: z.string().optional(),
});

export type LocationQueryParams = z.infer<typeof LocationQuerySchema>;

/**
 * Zod schema for source queries.
 */
export const SourceQuerySchema = z.object({
  active: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

export type SourceQueryParams = z.infer<typeof SourceQuerySchema>;
