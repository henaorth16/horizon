import { NextResponse } from "next/server";
import {
  getAllObservations,
  verifyDataIntegrity,
  getNationalProtectionMetrics,
} from "@/lib/db";
import { CANONICAL_SOURCES, CANONICAL_INDICATORS, CANONICAL_LOCATIONS } from "@/lib/data/registry";
import { apiSuccess, apiError } from "@/lib/api";

export async function GET() {
  try {
    const observations = getAllObservations();
    const integrity = verifyDataIntegrity();
    const metrics = getNationalProtectionMetrics();

    const uniqueSnapshots = Array.from(
      new Set(
        observations
          .map((o) => o.provenance?.datasetSnapshotId)
          .filter((id): id is string => Boolean(id))
      )
    );

    const dates = observations.map((o) => o.reportingDate).sort();
    const earliestDate = dates[0] || "2023-12-31";
    const latestDate = dates[dates.length - 1] || "2024-08-31";

    const metadata = {
      observatory: {
        name: "Ethiopia Migration & Displacement Observatory",
        version: "1.0.0",
        specification: "REST / JSON:API Envelope",
        licensingNotice: "All hosted statistics preserve original agency open data licenses (predominantly CC BY 4.0). Non-commercial and research usage welcomed with attribution.",
      },
      coverage: {
        earliestReportingDate: earliestDate,
        latestReportingDate: latestDate,
        administrativeLevelsCovered: [0, 1],
        geographicRegionsMonitored: 12,
        corePopulationTaxonomies: [
          "idp",
          "returnee",
          "refugee",
          "asylum_seeker",
          "international_migrant",
        ],
      },
      databaseStats: {
        totalObservations: observations.length,
        totalIndicators: CANONICAL_INDICATORS.length,
        totalLocations: CANONICAL_LOCATIONS.length,
        totalSources: CANONICAL_SOURCES.length,
        totalSnapshots: uniqueSnapshots.length,
        snapshots: uniqueSnapshots,
      },
      currentTotals: {
        idps: metrics.totalIdps,
        returnees: metrics.totalReturnees,
        hostedRefugees: metrics.totalRefugees,
        asylumSeekers: metrics.totalAsylumSeekers,
      },
      integrityReport: {
        status: integrity.passed ? "healthy" : "degraded",
        validObservations: integrity.validCount,
        rejectedObservations: integrity.errorCount,
        lastAudited: integrity.checkedAt,
      },
      availableEndpoints: [
        { path: "/api/observations", method: "GET", description: "Query individual displacement observations with filters and pagination" },
        { path: "/api/indicators", method: "GET", description: "List standardized indicator definitions and observational coverage" },
        { path: "/api/locations", method: "GET", description: "List administrative levels, P-codes, and regional boundaries" },
        { path: "/api/sources", method: "GET", description: "List primary publishers, update cadences, and mandates" },
        { path: "/api/metrics", method: "GET", description: "High-level national totals, driver distributions, and regional rankings" },
        { path: "/api/integrity", method: "GET", description: "Live automated data quality and integrity report" },
        { path: "/api/metadata", method: "GET", description: "Observatory catalog and dataset provenance summary" },
      ],
    };

    return apiSuccess(metadata, {
      total: observations.length,
      limit: observations.length,
      offset: 0,
      hasMore: false,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return apiError("SERVER_ERROR", message, 500);
  }
}
