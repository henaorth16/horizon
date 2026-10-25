import type { ValidatedObservation, QualityAlert } from "@/lib/contracts";
import { ETHIOPIA_REGION_PCODES } from "@/lib/geo/boundaries";

export interface QualityCheckResult {
  isValid: boolean;
  cleanedObservations: ValidatedObservation[];
  alerts: QualityAlert[];
  rejectedCount: number;
}

/**
 * Value interpretation distinction:
 * 0: Verified Zero (assessed, no displaced individuals observed)
 * null: Missing / Unassessed (site not visited or security denial)
 * undefined: Suppressed (too small to disclose safely, or withheld)
 */
export function interpretObservationValue(
  raw: unknown
): { value: number | null; isZero: boolean; isMissing: boolean; isSuppressed: boolean } {
  if (raw === 0 || raw === "0") {
    return { value: 0, isZero: true, isMissing: false, isSuppressed: false };
  }

  if (raw === null || raw === "" || raw === "NA" || raw === "N/A" || raw === "-") {
    return { value: null, isZero: false, isMissing: true, isSuppressed: false };
  }

  if (raw === "*" || raw === "<5" || raw === "suppressed") {
    return { value: null, isZero: false, isMissing: false, isSuppressed: true };
  }

  const num = typeof raw === "number" ? raw : parseFloat(String(raw).replace(/,/g, ""));
  if (Number.isNaN(num)) {
    return { value: null, isZero: false, isMissing: true, isSuppressed: false };
  }

  return { value: num, isZero: num === 0, isMissing: false, isSuppressed: false };
}

/**
 * Generates an MD5/string breakdown fingerprint for composite uniqueness.
 */
export function computeBreakdownFingerprint(obs: ValidatedObservation): string {
  const b = obs.breakdown || {};
  return `${obs.locationId}|${obs.indicatorId}|${obs.reportingDate}|${obs.populationType}|${b.sex || "all"}|${b.ageGroup || "all"}|${b.driver || "all"}|${b.originLocationId || ""}|${b.destinationLocationId || ""}`;
}

/**
 * Runs the comprehensive automated quality suite across an observation collection.
 */
export function runDataQualityChecks(
  observations: ValidatedObservation[]
): QualityCheckResult {
  const alerts: QualityAlert[] = [];
  const validMap = new Map<string, ValidatedObservation>();
  let rejectedCount = 0;

  const validPcodes = new Set([
    "ETH",
    "ET",
    ...Object.values(ETHIOPIA_REGION_PCODES).map((p) => p.pcode),
    ...Object.values(ETHIOPIA_REGION_PCODES).map((p) => p.id),
  ]);

  const timestamp = new Date().toISOString();

  for (const obs of observations) {
    let hasFatalError = false;

    // Rule 1: Reject negative values
    if (obs.value < 0) {
      alerts.push({
        id: `qa_neg_${obs.id}`,
        alertCode: "IMPLAUSIBLE_SPIKE",
        severity: "critical",
        observationId: obs.id,
        locationId: obs.locationId,
        indicatorId: obs.indicatorId,
        message: `Rejected observation with negative value: ${obs.value}`,
        timestamp,
      });
      hasFatalError = true;
    }

    // Rule 2: Outlier / Plausibility check (>15 million for a single subnational record)
    if (obs.value > 15_000_000) {
      alerts.push({
        id: `qa_spike_${obs.id}`,
        alertCode: "IMPLAUSIBLE_SPIKE",
        severity: "warning",
        observationId: obs.id,
        locationId: obs.locationId,
        indicatorId: obs.indicatorId,
        message: `Suspicious high caseload exceeding regional threshold: ${obs.value.toLocaleString()}`,
        timestamp,
      });
    }

    // Rule 3: Geographic P-code validation
    if (!validPcodes.has(obs.locationId) && !obs.locationId.startsWith("ET")) {
      alerts.push({
        id: `qa_geo_${obs.id}`,
        alertCode: "GEOGRAPHIC_MISMATCH",
        severity: "warning",
        observationId: obs.id,
        locationId: obs.locationId,
        message: `Location ID "${obs.locationId}" is not in standard Ethiopian P-code gazetteer`,
        timestamp,
      });
    }

    // Rule 4: Demographic breakdown completeness check
    if (!obs.breakdown?.sex && !obs.breakdown?.ageGroup && obs.indicatorId.includes("demographic")) {
      alerts.push({
        id: `qa_bd_${obs.id}`,
        alertCode: "MISSING_BREAKDOWN",
        severity: "info",
        observationId: obs.id,
        indicatorId: obs.indicatorId,
        message: `Observation lacks sex or age breakdown: aggregate total only`,
        timestamp,
      });
    }

    if (hasFatalError) {
      rejectedCount++;
      continue;
    }

    // Rule 5: Duplicate and Conflict Detection
    const key = computeBreakdownFingerprint(obs);
    const existing = validMap.get(key);

    if (existing) {
      if (existing.value === obs.value) {
        // Exact duplicate record: deduplicate cleanly
        alerts.push({
          id: `qa_dup_${obs.id}`,
          alertCode: "UNVERIFIED_ESTIMATE",
          severity: "info",
          observationId: obs.id,
          message: `Deduplicated identical record for key "${key}"`,
          timestamp,
        });
        continue;
      } else {
        // Conflicting values for identical composite key!
        alerts.push({
          id: `qa_conf_${obs.id}`,
          alertCode: "CONFUSION_RISK",
          severity: "warning",
          observationId: obs.id,
          message: `Conflict detected: existing value ${existing.value} vs new incoming value ${obs.value} for key "${key}". Preserving existing valid record.`,
          timestamp,
        });
        rejectedCount++;
        continue;
      }
    }

    validMap.set(key, obs);
  }

  return {
    isValid: rejectedCount === 0,
    cleanedObservations: Array.from(validMap.values()),
    alerts,
    rejectedCount,
  };
}
