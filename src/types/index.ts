/**
 * Core Data Models & Taxonomy Definitions
 * Strictly distinguishes population types to prevent misleading aggregation.
 */

export * from "@/lib/contracts";

export interface DataFreshnessRecord {
  sourceId: string;
  sourceName: string;
  lastIngestedAt: string;
  latestReferencePeriod: string;
  updateFrequency: "weekly" | "monthly" | "bi-monthly" | "annual" | "ad-hoc";
  status: "fresh" | "stale" | "outdated" | "error";
  recordCount: number;
}
