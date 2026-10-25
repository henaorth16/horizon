import type { ValidatedObservation, PopulationType, ConfidenceLevel } from "@/lib/contracts";

export const PCODE_TO_REGION_NAME: Record<string, string> = {
  ET: "Ethiopia (National)",
  ET01: "Tigray",
  ET02: "Afar",
  ET03: "Amhara",
  ET04: "Oromia",
  ET05: "Somali",
  ET06: "Benishangul-Gumuz",
  ET07: "Southern Nations (SNNPR)",
  ET10: "Sidama",
  ET12: "Gambela",
  ET13: "Harari",
  ET14: "Addis Ababa",
  ET15: "Dire Dawa",
};

export const ISO_TO_COUNTRY_NAME: Record<string, string> = {
  SSD: "South Sudan",
  SOM: "Somalia",
  ERI: "Eritrea",
  SDN: "Sudan",
  YEM: "Yemen",
  COD: "DR Congo",
};

export interface ObservationFilter {
  locationId?: string | string[];
  populationType?: PopulationType | PopulationType[];
  indicatorId?: string | string[];
  sourceId?: string | string[];
  driver?: string;
  minReportingDate?: string;
  maxReportingDate?: string;
  limit?: number;
  offset?: number;
  sortBy?: "value" | "reportingDate" | "locationId";
  sortDirection?: "asc" | "desc";
}

export interface QueryResult {
  total: number;
  limit: number;
  offset: number;
  data: ValidatedObservation[];
}

export interface RegionalCaseloadItem {
  pcode: string;
  regionName: string;
  idps: number;
  returnees: number;
  primaryDriver: string;
  confidence: ConfidenceLevel;
  reportingDate: string;
  citation: string;
}

export interface NationalProtectionMetrics {
  totalIdps: number;
  totalReturnees: number;
  totalRefugees: number;
  totalAsylumSeekers: number;
  idpReportingPeriod: string;
  refugeeReportingPeriod: string;
  idpCitation: string;
  refugeeCitation: string;
  retrievalDate: string;
}

export interface DriverBreakdownItem {
  driver: string;
  totalIdps: number;
  percentage: number;
  affectedRegions: string[];
}

export interface RefugeeOriginItem {
  originIso: string;
  originName: string;
  refugees: number;
  percentage: number;
  reportingDate: string;
  citation: string;
}

export interface IntegrityCheckReport {
  passed: boolean;
  totalRecordsChecked: number;
  validCount: number;
  errorCount: number;
  checkedAt: string;
  issues: string[];
  sourcesCovered: string[];
}

export interface DemographicAgeSexCohort {
  ageGroup: string;
  male: number;
  female: number;
  total: number;
  malePct: number;
  femalePct: number;
}

export interface DemographicProfile {
  populationType: PopulationType;
  locationId: string;
  locationName: string;
  cohorts: DemographicAgeSexCohort[];
  totalSample: number;
  maleTotal: number;
  femaleTotal: number;
  maleRatio: number;
  femaleRatio: number;
  hasDemographicBreakdown: boolean;
  missingReason?: string;
  reportingDate: string;
  citation: string;
  license: string;
}

export interface VulnerabilityMetricItem {
  id: string;
  label: string;
  value: string;
  rawPercentage: number;
  category: "household" | "child" | "gender" | "disability";
  source: string;
  notes?: string;
}

export interface RegionalDemographicComparisonItem {
  pcode: string;
  regionName: string;
  totalIdps: number;
  totalReturnees: number;
  primaryDriver: string;
  hasDemographics: boolean;
  childRatio?: number; // % 0-17
  adultRatio?: number; // % 18-59
  elderlyRatio?: number; // % 60+
  femaleRatio?: number; // % female
}

