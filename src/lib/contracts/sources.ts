import { z } from "zod";

export const SourceCadenceSchema = z.enum([
  "realtime",
  "daily",
  "weekly",
  "bimonthly",
  "monthly",
  "quarterly",
  "annual",
  "five_year_cycle",
  "ad_hoc",
]);

export const DataSourceSchema = z.object({
  id: z.string().min(2),
  name: z.string().min(2),
  organization: z.string().min(2),
  mandate: z.string(),
  homepageUrl: z.string().url(),
  apiUrl: z.string().url().optional(),
  license: z.string().min(2),
  licenseUrl: z.string().url().optional(),
  attributionRequired: z.boolean().default(true),
  attributionText: z.string().min(2),
  cadence: SourceCadenceSchema,
  contactEmail: z.string().email().optional(),
  active: z.boolean().default(true),
});

export const DatasetSnapshotStatusSchema = z.enum([
  "pending",
  "validated",
  "partially_valid",
  "failed",
  "superseded",
  "archived",
]);

export const DatasetSnapshotSchema = z.object({
  id: z.string().min(2),
  sourceId: z.string().min(2),
  versionLabel: z.string().min(1), // e.g. "Round 37" or "2024-Q2"
  snapshotDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/, "Must be valid ISO date (YYYY-MM-DD)"),
  retrievalTimestamp: z.string().datetime(),
  rawFilePath: z.string().min(1),
  rawFormat: z.enum(["json", "csv", "xlsx", "xml"]),
  checksumSha256: z.string().length(64),
  byteSize: z.number().int().nonnegative(),
  recordCount: z.number().int().nonnegative(),
  status: DatasetSnapshotStatusSchema,
  validationNotes: z.string().optional(),
});

export const IngestionRunSchema = z.object({
  id: z.string().min(2),
  snapshotId: z.string().min(2),
  sourceId: z.string().min(2),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable().optional(),
  status: z.enum(["running", "success", "failed", "aborted"]),
  rowsRead: z.number().int().nonnegative(),
  rowsValid: z.number().int().nonnegative(),
  rowsRejected: z.number().int().nonnegative(),
  errorSummary: z.array(z.string()).optional(),
});

export type DataSource = z.infer<typeof DataSourceSchema>;
export type DatasetSnapshot = z.infer<typeof DatasetSnapshotSchema>;
export type IngestionRun = z.infer<typeof IngestionRunSchema>;
export type SourceCadence = z.infer<typeof SourceCadenceSchema>;
