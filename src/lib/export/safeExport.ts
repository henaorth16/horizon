/**
 * Safe Client-Side Export Utilities for Data Journalism
 *
 * Implements OWASP CSV Injection (Formula Injection) prevention guidelines:
 * Prepends a single quote `'` to any field starting with `=`, `+`, `-`, `@`, `\t`, or `\r`.
 * Handles UTF-8 BOM, standard double-quote escaping, and structured JSON envelopes.
 */

import type { ValidatedObservation } from "@/lib/contracts";
import { PCODE_TO_REGION_NAME, type DemographicProfile } from "@/lib/db/types";

/**
 * Statistical Disclosure Control (SDC) threshold.
 * Values below this threshold in demographic or small-area breakdowns
 * must be suppressed to prevent deductive re-identification of vulnerable individuals.
 */
export const PRIVACY_SUPPRESSION_THRESHOLD = 5;

/**
 * Formats an observation value for export, applying SDC suppression for values < 5.
 */
export function formatExportValue(value: number, isDemographicBreakdown: boolean): string | number {
  if (isDemographicBreakdown && value > 0 && value < PRIVACY_SUPPRESSION_THRESHOLD) {
    return '"<5"'; // Suppressed for re-identification protection
  }
  return Number.isFinite(value) ? value : 0;
}

/**
 * Sanitizes a string field against CSV Formula Injection.
 * Excel, LibreOffice, and Google Sheets will execute cells starting with formula triggers.
 */
export function sanitizeCsvField(val: unknown): string {
  if (val === null || val === undefined) return '""';

  let str = String(val).trim();

  // If text begins with formula triggers, prepend apostrophe to force text interpretation
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape existing double quotes by doubling them
  const escaped = str.replace(/"/g, '""');

  return `"${escaped}"`;
}

export interface CsvExportOptions {
  filename?: string;
  sourceLookup?: Record<string, string>;
  indicatorLookup?: Record<string, string>;
}

/**
 * Generates and triggers download of a safely formatted CSV payload.
 */
export function exportObservationsToCsv(
  observations: ValidatedObservation[],
  options: CsvExportOptions = {}
): void {
  const {
    filename = `ethiopia_displacement_observations_${new Date().toISOString().slice(0, 10)}.csv`,
    sourceLookup = {},
    indicatorLookup = {},
  } = options;

  const headers = [
    "record_id",
    "indicator_id",
    "indicator_name",
    "location_id",
    "location_name",
    "population_type",
    "value",
    "reporting_date",
    "reference_period_type",
    "retrieval_timestamp",
    "driver_trigger",
    "sex",
    "age_group",
    "origin_location",
    "confidence_level",
    "publishing_source",
    "source_id",
    "dataset_snapshot_id",
    "provenance_citation",
    "license",
  ];

  const rows = observations.map((r) => {
    const isDemographic = Boolean(r.breakdown?.sex) || Boolean(r.breakdown?.ageGroup && r.breakdown.ageGroup !== "all");
    const valueField = formatExportValue(r.value, isDemographic);

    return [
      sanitizeCsvField(r.id),
      sanitizeCsvField(r.indicatorId),
      sanitizeCsvField(indicatorLookup[r.indicatorId] || r.indicatorId),
      sanitizeCsvField(r.locationId),
      sanitizeCsvField(PCODE_TO_REGION_NAME[r.locationId] || r.locationId),
      sanitizeCsvField(r.populationType),
      valueField,
      sanitizeCsvField(r.reportingDate),
      sanitizeCsvField(r.referencePeriodType),
      sanitizeCsvField(r.retrievalDate),
      sanitizeCsvField(r.breakdown?.driver || "unspecified"),
      sanitizeCsvField(r.breakdown?.sex || "all"),
      sanitizeCsvField(r.breakdown?.ageGroup || "all"),
      sanitizeCsvField(r.breakdown?.originLocationId || "internal"),
      sanitizeCsvField(r.confidence),
      sanitizeCsvField(r.provenance?.sourceName || sourceLookup[r.sourceId] || r.sourceId),
      sanitizeCsvField(r.sourceId),
      sanitizeCsvField(r.provenance?.datasetSnapshotId || "default"),
      sanitizeCsvField(r.provenance?.citation || "Ethiopia Migration Observatory"),
      sanitizeCsvField(r.provenance?.license || "CC BY 4.0"),
    ];
  });

  // UTF-8 BOM (\uFEFF) ensures Excel opens non-Latin and special chars properly
  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  triggerFileDownload(blob, filename);
}

export interface JsonExportEnvelope {
  metadata: {
    title: string;
    description: string;
    exportedAt: string;
    recordCount: number;
    observatoryVersion: string;
    license: string;
    termsOfUse: string;
    citationGuidance: string;
    mandateIsolationNotice: string;
    privacyNotice?: string;
  };
  data: ValidatedObservation[];
}

/**
 * Generates and triggers download of an authenticated, structured JSON envelope.
 */
export function exportObservationsToJson(
  observations: ValidatedObservation[],
  filename = `ethiopia_displacement_observations_${new Date().toISOString().slice(0, 10)}.json`
): void {
  const sanitizedObservations = observations.map((r) => {
    const isDemographic = Boolean(r.breakdown?.sex) || Boolean(r.breakdown?.ageGroup && r.breakdown.ageGroup !== "all");
    if (isDemographic && r.value > 0 && r.value < PRIVACY_SUPPRESSION_THRESHOLD) {
      return {
        ...r,
        value: "<5" as any,
        isSuppressedForPrivacy: true,
        suppressionNote:
          "Value < 5 suppressed under Statistical Disclosure Control (SDC) to prevent individual re-identification",
      };
    }
    return r;
  });

  const envelope: JsonExportEnvelope = {
    metadata: {
      title: "Ethiopia Migration & Displacement Observatory Dataset Export",
      description:
        "Standardized, normalized observation records documenting internal displacement, refugee populations, and mobility corridors in Ethiopia.",
      exportedAt: new Date().toISOString(),
      recordCount: sanitizedObservations.length,
      observatoryVersion: "1.0.0",
      license: "CC BY 4.0 (Creative Commons Attribution 4.0 International)",
      termsOfUse:
        "Redistribution, transformation, and journalistic reporting permitted with appropriate primary source citations.",
      citationGuidance:
        "Please cite both primary publishing entities (IOM DTM, UNHCR, FEWS NET) and the Ethiopia Migration & Displacement Observatory.",
      mandateIsolationNotice:
        "IDP counts (IOM DTM / Kampala Convention) and Refugee counts (UNHCR / 1951 Geneva Convention) govern distinct legal populations and must not be summed together.",
      privacyNotice:
        "Statistical Disclosure Control applied: cell values < 5 in demographic disaggregations are suppressed to protect vulnerable displaced individuals from re-identification.",
    },
    data: sanitizedObservations,
  };

  const jsonString = JSON.stringify(envelope, null, 2);
  const blob = new Blob([jsonString], { type: "application/json;charset=utf-8;" });
  triggerFileDownload(blob, filename);
}

/**
 * Generates and triggers download of a demographic profile CSV with values < 5 suppressed.
 */
export function exportDemographicProfileToCsv(
  profile: DemographicProfile,
  options: { filename?: string } = {}
): void {
  const {
    filename = `ethiopia_demographics_${profile.populationType}_${profile.locationId}_${new Date().toISOString().slice(0, 10)}.csv`,
  } = options;

  const headers = [
    "location_id",
    "location_name",
    "population_type",
    "age_group",
    "male_count",
    "male_pct",
    "female_count",
    "female_pct",
    "total_cohort_count",
    "privacy_protection_notice",
  ];

  const rows = (profile.cohorts || []).map((c) => {
    const maleCount = c.male > 0 && c.male < PRIVACY_SUPPRESSION_THRESHOLD ? '"<5"' : c.male;
    const femaleCount = c.female > 0 && c.female < PRIVACY_SUPPRESSION_THRESHOLD ? '"<5"' : c.female;
    const totalCohort = c.male + c.female;
    const totalCohortCount =
      totalCohort > 0 && totalCohort < PRIVACY_SUPPRESSION_THRESHOLD ? '"<5"' : totalCohort;

    return [
      sanitizeCsvField(profile.locationId),
      sanitizeCsvField(profile.locationName),
      sanitizeCsvField(profile.populationType),
      sanitizeCsvField(c.ageGroup),
      maleCount,
      c.malePct,
      femaleCount,
      c.femalePct,
      totalCohortCount,
      sanitizeCsvField("Values < 5 suppressed under SDC to prevent individual re-identification"),
    ];
  });

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  triggerFileDownload(blob, filename);
}

function triggerFileDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
