import { z } from "zod";

export const PopulationTypeSchema = z.enum([
  "idp",
  "refugee",
  "asylum_seeker",
  "returnee",
  "international_migrant",
  "mixed_flow",
  "host_community",
]);

export const ReferencePeriodTypeSchema = z.enum([
  "day",
  "month",
  "quarter",
  "year",
  "round",
]);

export const ConfidenceLevelSchema = z.enum([
  "high",       // Biometric registration / verified census
  "medium",     // Multi-informant site assessment (IOM DTM SA)
  "low",        // Rapid emergency projection / secondary triangulation
  "unverified", // Unconfirmed initial field alert
]);

export const DemographicBreakdownSchema = z.object({
  sex: z.enum(["female", "male", "unspecified"]).optional(),
  ageGroup: z.string().optional(), // e.g. "0-4", "5-11", "12-17", "18-59", "60+"
  driver: z
    .enum(["conflict", "drought", "floods", "seasonal_pastoral", "other", "unspecified"])
    .optional(),
  originLocationId: z.string().optional(),
  destinationLocationId: z.string().optional(),
  householdType: z
    .enum(["female_headed", "child_headed", "elderly_headed", "standard", "unspecified"])
    .optional(),
});

export const ProvenanceRecordSchema = z.object({
  sourceId: z.string().min(2),
  sourceName: z.string().min(2),
  datasetSnapshotId: z.string().min(2),
  ingestionRunId: z.string().optional(),
  retrievalTimestamp: z.string().datetime(),
  license: z.string().min(2),
  citation: z.string().min(5),
  transformationNotes: z.string().optional(),
});

export const QualityAlertCodeSchema = z.enum([
  "MISSING_BREAKDOWN",     // Missing age/sex breakdown in site report
  "TEMPORAL_GAP",         // Gap exceeding typical assessment frequency
  "CONFUSION_RISK",       // Risk of confusing IDP and refugee statistics
  "IMPLAUSIBLE_SPIKE",    // Sudden unrealistic population jump
  "STALE_SNAPSHOT",       // Data older than expected publication schedule
  "UNVERIFIED_ESTIMATE",  // Estimate lacking formal methodology notes
  "GEOGRAPHIC_MISMATCH",  // Coordinates outside referenced woreda boundary
]);

export const QualityAlertSchema = z.object({
  id: z.string().min(2),
  alertCode: QualityAlertCodeSchema,
  severity: z.enum(["info", "warning", "critical"]),
  locationId: z.string().optional(),
  indicatorId: z.string().optional(),
  observationId: z.string().optional(),
  message: z.string().min(5),
  timestamp: z.string().datetime(),
});

export const ObservationSchema = z.object({
  id: z.string().min(1),
  indicatorId: z.string().min(1),
  locationId: z.string().min(1),
  value: z.number().nonnegative(),
  reportingDate: z
    .string()
    .regex(/^\d{4}(-\d{2})?(-\d{2})?$/, "Invalid date format (must be YYYY, YYYY-MM, or YYYY-MM-DD)"),
  referencePeriodType: ReferencePeriodTypeSchema.default("month"),
  retrievalDate: z.string(), // Timestamp when observation was ingested/fetched
  sourceId: z.string().min(1),
  populationType: PopulationTypeSchema,
  confidence: ConfidenceLevelSchema.default("medium"),
  breakdown: DemographicBreakdownSchema.optional(),
  provenance: ProvenanceRecordSchema.optional(),
  qualityNotes: z.string().optional(),
  notes: z.string().optional(),
});

export type PopulationType = z.infer<typeof PopulationTypeSchema>;
export type ReferencePeriodType = z.infer<typeof ReferencePeriodTypeSchema>;
export type ConfidenceLevel = z.infer<typeof ConfidenceLevelSchema>;
export type DemographicBreakdown = z.infer<typeof DemographicBreakdownSchema>;
export type ProvenanceRecord = z.infer<typeof ProvenanceRecordSchema>;
export type QualityAlertCode = z.infer<typeof QualityAlertCodeSchema>;
export type QualityAlert = z.infer<typeof QualityAlertSchema>;
export type ValidatedObservation = z.infer<typeof ObservationSchema>;
export { LocationSchema, type ValidatedLocation } from "./locations";
