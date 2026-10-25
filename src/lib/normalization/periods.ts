import type { ReferencePeriodType } from "@/lib/contracts";

export interface NormalizedPeriod {
  reportingDate: string; // Canonical format: YYYY-MM-DD, YYYY-MM, or YYYY
  referencePeriodType: ReferencePeriodType;
  isValid: boolean;
  error?: string;
}

/**
 * Normalizes an arbitrary date string into canonical reportingDate and referencePeriodType.
 */
export function normalizeReportingPeriod(
  raw: string | number | null | undefined,
  contextYear?: number
): NormalizedPeriod {
  if (raw === null || raw === undefined) {
    return { reportingDate: "unknown", referencePeriodType: "month", isValid: false, error: "Missing date" };
  }

  const str = String(raw).trim();

  // 1. ISO full timestamp or YYYY-MM-DD
  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);

    if (m < 1 || m > 12 || d < 1 || d > 31) {
      return { reportingDate: str, referencePeriodType: "day", isValid: false, error: "Calendar day/month out of range" };
    }

    return {
      reportingDate: `${year}-${month}-${day}`,
      referencePeriodType: "day",
      isValid: true,
    };
  }

  // 2. YYYY-MM (Monthly)
  const monthMatch = str.match(/^(\d{4})-(\d{2})$/);
  if (monthMatch) {
    const [, year, month] = monthMatch;
    const m = parseInt(month, 10);
    if (m < 1 || m > 12) {
      return { reportingDate: str, referencePeriodType: "month", isValid: false, error: "Month out of range" };
    }
    return {
      reportingDate: `${year}-${month}`,
      referencePeriodType: "month",
      isValid: true,
    };
  }

  // 3. YYYY (Annual)
  if (/^\d{4}$/.test(str)) {
    const y = parseInt(str, 10);
    if (y < 1960 || y > 2030) {
      return { reportingDate: str, referencePeriodType: "year", isValid: false, error: "Year out of plausibility range" };
    }
    return {
      reportingDate: str,
      referencePeriodType: "year",
      isValid: true,
    };
  }

  // 4. Round-based (e.g. "Round 37" or "Round 36")
  const roundMatch = str.match(/round\s*(\d+)/i);
  if (roundMatch) {
    const roundNum = parseInt(roundMatch[1], 10);
    const year = contextYear || 2024;
    return {
      reportingDate: `${year}-R${roundNum}`,
      referencePeriodType: "round",
      isValid: true,
    };
  }

  return {
    reportingDate: str,
    referencePeriodType: "month",
    isValid: false,
    error: `Unrecognized date format: "${str}"`,
  };
}
