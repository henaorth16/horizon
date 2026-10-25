import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { ValidatedObservation, DatasetSnapshot, IngestionRun, QualityAlert } from "@/lib/contracts";
import { runDataQualityChecks } from "@/lib/quality/rules";

export interface PipelineExecutionOptions {
  sourceId: string;
  versionLabel: string;
  snapshotDate: string; // YYYY-MM-DD
  rawPayload: string;   // JSON or CSV string
  format: "json" | "csv";
  extractorFn: (rawPayload: string, snapshotId: string) => Promise<ValidatedObservation[]>;
}

export interface IngestionResult {
  snapshot: DatasetSnapshot;
  run: IngestionRun;
  observations: ValidatedObservation[];
  alerts: QualityAlert[];
  savedPath: string;
}

/**
 * Idempotent Ingestion Pipeline Orchestrator
 */
export async function executeIngestionPipeline(
  options: PipelineExecutionOptions
): Promise<IngestionResult> {
  const { sourceId, versionLabel, snapshotDate, rawPayload, format, extractorFn } = options;
  const startedAt = new Date().toISOString();

  // 1. Calculate cryptographic checksum (SHA-256)
  const checksumSha256 = crypto.createHash("sha256").update(rawPayload, "utf-8").digest("hex");
  const byteSize = Buffer.byteLength(rawPayload, "utf-8");
  const snapshotId = `snap_${sourceId}_${versionLabel.toLowerCase().replace(/[\s-]+/g, "_")}_${snapshotDate.replace(/-/g, "")}`;

  // 2. Persist versioned raw payload
  const rawDir = path.resolve(process.cwd(), "data/raw", sourceId);
  fs.mkdirSync(rawDir, { recursive: true });
  const rawFilePath = path.join(rawDir, `${snapshotId}.${format}`);
  fs.writeFileSync(rawFilePath, rawPayload, "utf-8");

  // 3. Extract and normalize raw records
  let rawObservations: ValidatedObservation[] = [];
  try {
    rawObservations = await extractorFn(rawPayload, snapshotId);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const failedRun: IngestionRun = {
      id: `run_${Date.now()}`,
      snapshotId,
      sourceId,
      startedAt,
      completedAt: new Date().toISOString(),
      status: "failed",
      rowsRead: 0,
      rowsValid: 0,
      rowsRejected: 0,
      errorSummary: [errorMsg],
    };

    const snapshot: DatasetSnapshot = {
      id: snapshotId,
      sourceId,
      versionLabel,
      snapshotDate,
      retrievalTimestamp: startedAt,
      rawFilePath,
      rawFormat: format,
      checksumSha256,
      byteSize,
      recordCount: 0,
      status: "failed",
      validationNotes: errorMsg,
    };

    throw new Error(`Ingestion extraction failed: ${errorMsg}`);
  }

  // 4. Run automated data quality checks
  const quality = runDataQualityChecks(rawObservations);

  // 5. Store processed observations in local persistent JSON store (idempotently merged)
  const processedDir = path.resolve(process.cwd(), "data/processed");
  fs.mkdirSync(processedDir, { recursive: true });
  const processedFilePath = path.join(processedDir, `${sourceId}_observations.json`);

  let existingObservations: ValidatedObservation[] = [];
  if (fs.existsSync(processedFilePath)) {
    try {
      existingObservations = JSON.parse(fs.readFileSync(processedFilePath, "utf-8"));
    } catch {
      existingObservations = [];
    }
  }

  // Merge with existing observations idempotently
  const obsMap = new Map<string, ValidatedObservation>();
  for (const obs of existingObservations) {
    obsMap.set(obs.id, obs);
  }
  for (const obs of quality.cleanedObservations) {
    obsMap.set(obs.id, obs);
  }

  const mergedObservations = Array.from(obsMap.values());
  fs.writeFileSync(processedFilePath, JSON.stringify(mergedObservations, null, 2), "utf-8");

  // 6. Complete Ingestion Run record
  const completedAt = new Date().toISOString();
  const run: IngestionRun = {
    id: `run_${Date.now()}`,
    snapshotId,
    sourceId,
    startedAt,
    completedAt,
    status: quality.isValid ? "success" : "failed",
    rowsRead: rawObservations.length,
    rowsValid: quality.cleanedObservations.length,
    rowsRejected: quality.rejectedCount,
    errorSummary: quality.alerts.filter((a) => a.severity === "critical").map((a) => a.message),
  };

  const snapshot: DatasetSnapshot = {
    id: snapshotId,
    sourceId,
    versionLabel,
    snapshotDate,
    retrievalTimestamp: startedAt,
    rawFilePath,
    rawFormat: format,
    checksumSha256,
    byteSize,
    recordCount: quality.cleanedObservations.length,
    status: quality.isValid ? "validated" : "partially_valid",
    validationNotes: `Validated ${quality.cleanedObservations.length} observations with ${quality.alerts.length} quality alerts.`,
  };

  return {
    snapshot,
    run,
    observations: quality.cleanedObservations,
    alerts: quality.alerts,
    savedPath: processedFilePath,
  };
}
