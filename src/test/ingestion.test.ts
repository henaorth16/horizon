import { describe, it, expect, beforeEach, afterEach, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { normalizePopulationType, arePopulationsAdditive } from "@/lib/normalization/taxonomy";
import { normalizeSex, normalizeAgeBracket, normalizeDriver } from "@/lib/normalization/demographics";
import { normalizeReportingPeriod } from "@/lib/normalization/periods";
import {
  interpretObservationValue,
  computeBreakdownFingerprint,
  runDataQualityChecks,
} from "@/lib/quality/rules";
import { executeIngestionPipeline } from "@/lib/ingestion/pipeline";
import type { ValidatedObservation } from "@/lib/contracts";

describe("Normalization Rules: Population Taxonomy", () => {
  it("normalizes diverse raw strings to canonical PopulationType", () => {
    expect(normalizePopulationType("IDPs")).toBe("idp");
    expect(normalizePopulationType("Internally Displaced Persons")).toBe("idp");
    expect(normalizePopulationType("registered_refugees")).toBe("refugee");
    expect(normalizePopulationType("Asylum-seekers")).toBe("asylum_seeker");
    expect(normalizePopulationType("returned_idps")).toBe("returnee");
    expect(normalizePopulationType("migrant_stock")).toBe("international_migrant");
  });

  it("enforces non-additive population rule", () => {
    expect(arePopulationsAdditive("idp", "idp")).toBe(true);
    expect(arePopulationsAdditive("idp", "refugee")).toBe(false);
    expect(arePopulationsAdditive("refugee", "asylum_seeker")).toBe(false);
  });
});

describe("Normalization Rules: Demographics & Periods", () => {
  it("normalizes sex/gender values accurately", () => {
    expect(normalizeSex("Female")).toBe("female");
    expect(normalizeSex("F")).toBe("female");
    expect(normalizeSex("Women")).toBe("female");
    expect(normalizeSex("Male")).toBe("male");
    expect(normalizeSex("M")).toBe("male");
    expect(normalizeSex("Unknown")).toBe("unspecified");
    expect(normalizeSex(null)).toBe("unspecified");
  });

  it("normalizes age brackets", () => {
    expect(normalizeAgeBracket("0-4")).toBe("0-4");
    expect(normalizeAgeBracket("<5")).toBe("0-4");
    expect(normalizeAgeBracket("5-11")).toBe("5-11");
    expect(normalizeAgeBracket("primary")).toBe("5-11");
    expect(normalizeAgeBracket("18-59")).toBe("18-59");
    expect(normalizeAgeBracket("60+")).toBe("60+");
  });

  it("normalizes displacement drivers", () => {
    expect(normalizeDriver("conflict")).toBe("conflict");
    expect(normalizeDriver("intercommunal violence")).toBe("conflict");
    expect(normalizeDriver("drought")).toBe("drought");
    expect(normalizeDriver("flash_floods")).toBe("floods");
    expect(normalizeDriver("seasonal pastoral")).toBe("seasonal_pastoral");
  });

  it("normalizes reporting periods and catches invalid calendars", () => {
    const validDay = normalizeReportingPeriod("2024-08-31");
    expect(validDay.isValid).toBe(true);
    expect(validDay.referencePeriodType).toBe("day");

    const validMonth = normalizeReportingPeriod("2024-06");
    expect(validMonth.isValid).toBe(true);
    expect(validMonth.referencePeriodType).toBe("month");

    const validRound = normalizeReportingPeriod("Round 37", 2024);
    expect(validRound.isValid).toBe(true);
    expect(validRound.reportingDate).toBe("2024-R37");

    const invalidMonth = normalizeReportingPeriod("2024-15-01");
    expect(invalidMonth.isValid).toBe(false);
  });
});

describe("Data Quality Checks Engine", () => {
  it("distinguishes zero from missing and suppressed values", () => {
    expect(interpretObservationValue(0)).toEqual({
      value: 0,
      isZero: true,
      isMissing: false,
      isSuppressed: false,
    });

    expect(interpretObservationValue("0")).toEqual({
      value: 0,
      isZero: true,
      isMissing: false,
      isSuppressed: false,
    });

    expect(interpretObservationValue(null)).toEqual({
      value: null,
      isZero: false,
      isMissing: true,
      isSuppressed: false,
    });

    expect(interpretObservationValue("<5")).toEqual({
      value: null,
      isZero: false,
      isMissing: false,
      isSuppressed: true,
    });
  });

  it("detects and rejects negative values and alerts on outliers", () => {
    const records: ValidatedObservation[] = [
      {
        id: "obs_good",
        indicatorId: "idp_stock",
        locationId: "ET01",
        value: 50000,
        reportingDate: "2024-08",
        referencePeriodType: "month",
        retrievalDate: "2026-10-22T04:00:00Z",
        sourceId: "iom_dtm",
        populationType: "idp",
        confidence: "medium",
      },
      {
        id: "obs_neg",
        indicatorId: "idp_stock",
        locationId: "ET02",
        value: -200,
        reportingDate: "2024-08",
        referencePeriodType: "month",
        retrievalDate: "2026-10-22T04:00:00Z",
        sourceId: "iom_dtm",
        populationType: "idp",
        confidence: "medium",
      },
      {
        id: "obs_spike",
        indicatorId: "idp_stock",
        locationId: "ET03",
        value: 25_000_000, // Spike > 15M
        reportingDate: "2024-08",
        referencePeriodType: "month",
        retrievalDate: "2026-10-22T04:00:00Z",
        sourceId: "iom_dtm",
        populationType: "idp",
        confidence: "medium",
      },
    ];

    const result = runDataQualityChecks(records);
    expect(result.isValid).toBe(false);
    expect(result.rejectedCount).toBe(1); // The negative one was rejected
    expect(result.cleanedObservations.length).toBe(2);

    const negAlert = result.alerts.find((a) => a.observationId === "obs_neg");
    expect(negAlert?.severity).toBe("critical");

    const spikeAlert = result.alerts.find((a) => a.observationId === "obs_spike");
    expect(spikeAlert?.severity).toBe("warning");
  });

  it("deduplicates identical records cleanly", () => {
    const records: ValidatedObservation[] = [
      {
        id: "obs_1",
        indicatorId: "idp_stock",
        locationId: "ET01",
        value: 50000,
        reportingDate: "2024-08",
        referencePeriodType: "month",
        retrievalDate: "2026-10-22T04:00:00Z",
        sourceId: "iom_dtm",
        populationType: "idp",
        confidence: "medium",
      },
      {
        id: "obs_1_dup",
        indicatorId: "idp_stock",
        locationId: "ET01",
        value: 50000,
        reportingDate: "2024-08",
        referencePeriodType: "month",
        retrievalDate: "2026-10-22T04:00:00Z",
        sourceId: "iom_dtm",
        populationType: "idp",
        confidence: "medium",
      },
    ];

    const result = runDataQualityChecks(records);
    expect(result.cleanedObservations.length).toBe(1);
    expect(result.alerts.some((a) => a.alertCode === "UNVERIFIED_ESTIMATE")).toBe(true);
  });

  it("flags conflicts when records share identical keys but differ in value", () => {
    const records: ValidatedObservation[] = [
      {
        id: "obs_a",
        indicatorId: "idp_stock",
        locationId: "ET01",
        value: 50000,
        reportingDate: "2024-08",
        referencePeriodType: "month",
        retrievalDate: "2026-10-22T04:00:00Z",
        sourceId: "iom_dtm",
        populationType: "idp",
        confidence: "medium",
      },
      {
        id: "obs_b_conflict",
        indicatorId: "idp_stock",
        locationId: "ET01",
        value: 99999, // Conflicting value
        reportingDate: "2024-08",
        referencePeriodType: "month",
        retrievalDate: "2026-10-22T04:00:00Z",
        sourceId: "iom_dtm",
        populationType: "idp",
        confidence: "medium",
      },
    ];

    const result = runDataQualityChecks(records);
    expect(result.cleanedObservations.length).toBe(1);
    expect(result.cleanedObservations[0].value).toBe(50000); // Preserved original
    expect(result.alerts.some((a) => a.alertCode === "CONFUSION_RISK")).toBe(true);
  });
});

describe("Pipeline Execution & Idempotency", () => {
  it("executes ingestion pipeline idempotently and persists raw snapshot", async () => {
    const samplePayload = JSON.stringify([
      { pcode: "ET01", idps: 100000, date: "2024-08-31" },
      { pcode: "ET04", idps: 200000, date: "2024-08-31" },
    ]);

    const extractor = async (raw: string, snapshotId: string) => {
      const items = JSON.parse(raw);
      return items.map((item: any, idx: number) => ({
        id: `test_obs_${item.pcode}_${idx}`,
        indicatorId: "idp_stock",
        locationId: item.pcode,
        value: item.idps,
        reportingDate: item.date,
        referencePeriodType: "day" as const,
        retrievalDate: new Date().toISOString(),
        sourceId: "test_source",
        populationType: "idp" as const,
      }));
    };

    // First execution
    const res1 = await executeIngestionPipeline({
      sourceId: "test_source",
      versionLabel: "Test V1",
      snapshotDate: "2024-08-31",
      rawPayload: samplePayload,
      format: "json",
      extractorFn: extractor,
    });

    expect(res1.snapshot.status).toBe("validated");
    expect(res1.observations.length).toBe(2);
    expect(fs.existsSync(res1.snapshot.rawFilePath)).toBe(true);

    // Second execution with identical payload (idempotent verification)
    const res2 = await executeIngestionPipeline({
      sourceId: "test_source",
      versionLabel: "Test V1",
      snapshotDate: "2024-08-31",
      rawPayload: samplePayload,
      format: "json",
      extractorFn: extractor,
    });

    expect(res2.observations.length).toBe(2);
    const stored = JSON.parse(fs.readFileSync(res2.savedPath, "utf-8"));
    expect(stored.length).toBe(2); // No duplication!
  });

  afterAll(() => {
    try {
      const processedTest = path.resolve(process.cwd(), "data/processed/test_source_observations.json");
      if (fs.existsSync(processedTest)) fs.unlinkSync(processedTest);
      const rawTest = path.resolve(process.cwd(), "data/raw/test_source");
      if (fs.existsSync(rawTest)) fs.rmSync(rawTest, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  });
});
