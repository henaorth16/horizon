import { describe, it, expect } from "vitest";
import {
  normalizeAgeBracket,
  normalizeSex,
  normalizeDriver,
  STANDARD_AGE_BRACKETS,
  type NormalizedSex,
  type NormalizedDriver,
} from "@/lib/normalization/demographics";
import {
  normalizeReportingPeriod,
  type NormalizedPeriod,
} from "@/lib/normalization/periods";
import {
  normalizePopulationType,
  arePopulationsAdditive,
  POPULATION_TAXONOMY_MAP,
} from "@/lib/normalization/taxonomy";
import {
  ETHIOPIA_REGION_PCODES,
  decodeTopojson,
} from "@/lib/geo/boundaries";
import { PCODE_TO_REGION_NAME } from "@/lib/db/types";
import {
  interpretObservationValue,
  computeBreakdownFingerprint,
  runDataQualityChecks,
} from "@/lib/quality/rules";
import type { ValidatedObservation } from "@/lib/contracts";

describe("Demographic Normalization & Age-Bracket Mappers", () => {
  it("normalizes standard and non-standard age bracket strings", () => {
    // Standard cohorts
    expect(normalizeAgeBracket("0-4")).toBe("0-4");
    expect(normalizeAgeBracket("5-11")).toBe("5-11");
    expect(normalizeAgeBracket("12-17")).toBe("12-17");
    expect(normalizeAgeBracket("18-59")).toBe("18-59");
    expect(normalizeAgeBracket("60+")).toBe("60+");

    // Aliases and colloquial terms
    expect(normalizeAgeBracket("under5")).toBe("0-4");
    expect(normalizeAgeBracket("<5")).toBe("0-4");
    expect(normalizeAgeBracket("0-5")).toBe("0-4");
    expect(normalizeAgeBracket("primary")).toBe("5-11");
    expect(normalizeAgeBracket("5-12")).toBe("5-11");
    expect(normalizeAgeBracket("adolescent")).toBe("12-17");
    expect(normalizeAgeBracket("secondary")).toBe("12-17");
    expect(normalizeAgeBracket("13-17")).toBe("12-17");
    expect(normalizeAgeBracket("adult")).toBe("18-59");
    expect(normalizeAgeBracket("working_age")).toBe("18-59");
    expect(normalizeAgeBracket("18-64")).toBe("18-59");
    expect(normalizeAgeBracket("elderly")).toBe("60+");
    expect(normalizeAgeBracket("60_plus")).toBe("60+");
    expect(normalizeAgeBracket("65+")).toBe("60+");

    // Null, empty, and non-standard custom brackets
    expect(normalizeAgeBracket(null)).toBe("unspecified");
    expect(normalizeAgeBracket(undefined)).toBe("unspecified");
    expect(normalizeAgeBracket("")).toBe("unspecified");
    expect(normalizeAgeBracket("25-34")).toBe("25-34"); // Preserves custom brackets
  });

  it("normalizes sex strings into canonical categories", () => {
    expect(normalizeSex("f")).toBe("female");
    expect(normalizeSex("female")).toBe("female");
    expect(normalizeSex("females")).toBe("female");
    expect(normalizeSex("women")).toBe("female");
    expect(normalizeSex("girls")).toBe("female");

    expect(normalizeSex("m")).toBe("male");
    expect(normalizeSex("male")).toBe("male");
    expect(normalizeSex("males")).toBe("male");
    expect(normalizeSex("men")).toBe("male");
    expect(normalizeSex("boys")).toBe("male");

    expect(normalizeSex("u")).toBe("unspecified");
    expect(normalizeSex("unknown")).toBe("unspecified");
    expect(normalizeSex("other")).toBe("unspecified");
    expect(normalizeSex(null)).toBe("unspecified");
    expect(normalizeSex(undefined)).toBe("unspecified");
  });

  it("normalizes displacement drivers across conflict, drought, and flood taxonomy", () => {
    expect(normalizeDriver("conflict")).toBe("conflict");
    expect(normalizeDriver("violence")).toBe("conflict");
    expect(normalizeDriver("intercommunal violence")).toBe("conflict");
    expect(normalizeDriver("war")).toBe("conflict");
    expect(normalizeDriver("insecurity")).toBe("conflict");

    expect(normalizeDriver("drought")).toBe("drought");
    expect(normalizeDriver("water shortage")).toBe("drought");
    expect(normalizeDriver("dry_spell")).toBe("drought");

    expect(normalizeDriver("flood")).toBe("floods");
    expect(normalizeDriver("floods")).toBe("floods");
    expect(normalizeDriver("flash floods")).toBe("floods");
    expect(normalizeDriver("riverine floods")).toBe("floods");

    expect(normalizeDriver("pastoral")).toBe("seasonal_pastoral");
    expect(normalizeDriver("seasonal pastoral")).toBe("seasonal_pastoral");

    expect(normalizeDriver("unknown")).toBe("unspecified");
    expect(normalizeDriver(null)).toBe("unspecified");
    expect(normalizeDriver("other factor")).toBe("other");
  });

  it("verifies STANDARD_AGE_BRACKETS constant contains all required cohorts", () => {
    expect(STANDARD_AGE_BRACKETS).toEqual(["0-4", "5-11", "12-17", "18-59", "60+"]);
  });
});

describe("Reporting Period Normalization", () => {
  it("normalizes ISO full timestamp into canonical daily period", () => {
    const res = normalizeReportingPeriod("2024-08-31T00:00:00.000Z");
    expect(res.isValid).toBe(true);
    expect(res.reportingDate).toBe("2024-08-31");
    expect(res.referencePeriodType).toBe("day");
  });

  it("normalizes monthly and annual dates", () => {
    const monthly = normalizeReportingPeriod("2024-08");
    expect(monthly.isValid).toBe(true);
    expect(monthly.reportingDate).toBe("2024-08");
    expect(monthly.referencePeriodType).toBe("month");

    const annual = normalizeReportingPeriod("2024");
    expect(annual.isValid).toBe(true);
    expect(annual.reportingDate).toBe("2024");
    expect(annual.referencePeriodType).toBe("year");
  });

  it("normalizes round-based reporting periods", () => {
    const roundRes = normalizeReportingPeriod("Round 37", 2024);
    expect(roundRes.isValid).toBe(true);
    expect(roundRes.reportingDate).toBe("2024-R37");
    expect(roundRes.referencePeriodType).toBe("round");
  });

  it("flags out-of-range dates and malformed strings as invalid", () => {
    const invalidMonth = normalizeReportingPeriod("2024-13-10");
    expect(invalidMonth.isValid).toBe(false);

    const invalidYear = normalizeReportingPeriod("1800");
    expect(invalidYear.isValid).toBe(false);

    const unparseable = normalizeReportingPeriod("not-a-date");
    expect(unparseable.isValid).toBe(false);

    const nullDate = normalizeReportingPeriod(null);
    expect(nullDate.isValid).toBe(false);
  });
});

describe("Population Taxonomy & Non-Additive Principle", () => {
  it("normalizes population category aliases to canonical categories", () => {
    expect(normalizePopulationType("idp")).toBe("idp");
    expect(normalizePopulationType("internally displaced persons")).toBe("idp");
    expect(normalizePopulationType("sa_idp")).toBe("idp");

    expect(normalizePopulationType("refugee")).toBe("refugee");
    expect(normalizePopulationType("mandate_refugees")).toBe("refugee");
    expect(normalizePopulationType("registered_refugees")).toBe("refugee");

    expect(normalizePopulationType("asylum seeker")).toBe("asylum_seeker");
    expect(normalizePopulationType("asylum-seekers")).toBe("asylum_seeker");

    expect(normalizePopulationType("returnees")).toBe("returnee");
    expect(normalizePopulationType("returned_idps")).toBe("returnee");

    expect(normalizePopulationType("migrant_stock")).toBe("international_migrant");
    expect(normalizePopulationType("transit_migrants")).toBe("mixed_flow");
    expect(normalizePopulationType("host_community")).toBe("host_community");

    expect(normalizePopulationType(null)).toBe("idp");
  });

  it("enforces non-additive humanitarian principle between IDPs and Refugees", () => {
    // Same population groups can be summed within mandate
    expect(arePopulationsAdditive("idp", "idp")).toBe(true);
    expect(arePopulationsAdditive("refugee", "refugee")).toBe(true);

    // Cross-mandate summation is strictly prohibited
    expect(arePopulationsAdditive("idp", "refugee")).toBe(false);
    expect(arePopulationsAdditive("refugee", "idp")).toBe(false);
    expect(arePopulationsAdditive("idp", "returnee")).toBe(false);
    expect(arePopulationsAdditive("refugee", "host_community")).toBe(false);
  });
});

describe("Location P-Code Lookups & Geographic Resolution", () => {
  it("resolves all Ethiopian regions to standardized P-codes and ISO IDs", () => {
    expect(ETHIOPIA_REGION_PCODES["Tigray"]).toEqual({
      pcode: "ET01",
      id: "ET-TI",
      name: "Tigray",
    });
    expect(ETHIOPIA_REGION_PCODES["Afar"]).toEqual({
      pcode: "ET02",
      id: "ET-AF",
      name: "Afar",
    });
    expect(ETHIOPIA_REGION_PCODES["Amhara"]).toEqual({
      pcode: "ET03",
      id: "ET-AM",
      name: "Amhara",
    });
    expect(ETHIOPIA_REGION_PCODES["Oromia"]).toEqual({
      pcode: "ET04",
      id: "ET-OR",
      name: "Oromia",
    });
    expect(ETHIOPIA_REGION_PCODES["Somali"]).toEqual({
      pcode: "ET05",
      id: "ET-SO",
      name: "Somali",
    });
    expect(ETHIOPIA_REGION_PCODES["Benishangul-Gumuz"]).toEqual({
      pcode: "ET06",
      id: "ET-BE",
      name: "Benishangul-Gumuz",
    });
    expect(ETHIOPIA_REGION_PCODES["Addis Ababa"]).toEqual({
      pcode: "ET14",
      id: "ET-AA",
      name: "Addis Ababa",
    });
    expect(ETHIOPIA_REGION_PCODES["Dire Dawa"]).toEqual({
      pcode: "ET15",
      id: "ET-DD",
      name: "Dire Dawa",
    });
  });

  it("resolves P-codes to human-readable region names via PCODE_TO_REGION_NAME", () => {
    expect(PCODE_TO_REGION_NAME["ET"]).toBe("Ethiopia (National)");
    expect(PCODE_TO_REGION_NAME["ET01"]).toBe("Tigray");
    expect(PCODE_TO_REGION_NAME["ET02"]).toBe("Afar");
    expect(PCODE_TO_REGION_NAME["ET03"]).toBe("Amhara");
    expect(PCODE_TO_REGION_NAME["ET04"]).toBe("Oromia");
    expect(PCODE_TO_REGION_NAME["ET05"]).toBe("Somali");
    expect(PCODE_TO_REGION_NAME["ET06"]).toBe("Benishangul-Gumuz");
    expect(PCODE_TO_REGION_NAME["ET07"]).toBe("Southern Nations (SNNPR)");
    expect(PCODE_TO_REGION_NAME["ET10"]).toBe("Sidama");
    expect(PCODE_TO_REGION_NAME["ET12"]).toBe("Gambela");
    expect(PCODE_TO_REGION_NAME["ET13"]).toBe("Harari");
    expect(PCODE_TO_REGION_NAME["ET14"]).toBe("Addis Ababa");
    expect(PCODE_TO_REGION_NAME["ET15"]).toBe("Dire Dawa");
  });

  it("decodes TopoJSON and attaches resolved P-code properties", () => {
    const mockTopology = {
      type: "Topology" as const,
      objects: {
        ethiopia: {
          type: "GeometryCollection" as const,
          geometries: [
            {
              type: "Polygon" as const,
              arcs: [[0]],
              properties: { shapeName: "Tigray", shapeType: "ADM1" },
            },
            {
              type: "Polygon" as const,
              arcs: [[1]],
              properties: { shapeName: "Oromia", shapeType: "ADM1" },
            },
          ],
        },
      },
      arcs: [
        [
          [38, 14],
          [39, 14],
          [39, 13],
          [38, 14],
        ],
        [
          [38, 8],
          [39, 8],
          [39, 7],
          [38, 8],
        ],
      ],
    };

    const fc = decodeTopojson(mockTopology, "ethiopia");
    expect(fc.features).toHaveLength(2);
    expect(fc.features[0].properties.pcode).toBe("ET01");
    expect(fc.features[0].properties.name).toBe("Tigray");
    expect(fc.features[0].properties.adminLevel).toBe(1);
    expect(fc.features[1].properties.pcode).toBe("ET04");
    expect(fc.features[1].properties.name).toBe("Oromia");
  });
});

describe("Data Quality Validation Rules & Interpretation", () => {
  it("interprets raw observation values into Verified Zero, Missing, and Suppressed", () => {
    // 0 = Verified Zero
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

    // Null/NA/- = Missing / Unassessed
    expect(interpretObservationValue(null)).toEqual({
      value: null,
      isZero: false,
      isMissing: true,
      isSuppressed: false,
    });
    expect(interpretObservationValue("NA")).toEqual({
      value: null,
      isZero: false,
      isMissing: true,
      isSuppressed: false,
    });
    expect(interpretObservationValue("-")).toEqual({
      value: null,
      isZero: false,
      isMissing: true,
      isSuppressed: false,
    });

    // <5/* = Suppressed (SDC)
    expect(interpretObservationValue("<5")).toEqual({
      value: null,
      isZero: false,
      isMissing: false,
      isSuppressed: true,
    });
    expect(interpretObservationValue("*")).toEqual({
      value: null,
      isZero: false,
      isMissing: false,
      isSuppressed: true,
    });
    expect(interpretObservationValue("suppressed")).toEqual({
      value: null,
      isZero: false,
      isMissing: false,
      isSuppressed: true,
    });

    // Formatted numbers
    expect(interpretObservationValue("1,025,400")).toEqual({
      value: 1025400,
      isZero: false,
      isMissing: false,
      isSuppressed: false,
    });
  });

  it("computes deterministic breakdown fingerprints for composite uniqueness", () => {
    const obs: ValidatedObservation = {
      id: "obs_test_1",
      indicatorId: "idp_stock_present",
      locationId: "ET01",
      value: 1000,
      reportingDate: "2024-08-31",
      referencePeriodType: "round",
      retrievalDate: "2026-10-22T04:15:00.000Z",
      sourceId: "iom_dtm",
      populationType: "idp",
      confidence: "high",
      breakdown: {
        sex: "female",
        ageGroup: "18-59",
        driver: "conflict",
      },
    };

    const fp = computeBreakdownFingerprint(obs);
    expect(fp).toBe("ET01|idp_stock_present|2024-08-31|idp|female|18-59|conflict||");
  });

  it("executes runDataQualityChecks: rejects negative values and deduplicates identical records", () => {
    const baseObs: ValidatedObservation = {
      id: "obs_valid_1",
      indicatorId: "idp_stock_present",
      locationId: "ET01",
      value: 50000,
      reportingDate: "2024-08-31",
      referencePeriodType: "round",
      retrievalDate: "2026-10-22T04:15:00.000Z",
      sourceId: "iom_dtm",
      populationType: "idp",
      confidence: "medium",
    };

    const duplicateObs: ValidatedObservation = {
      ...baseObs,
      id: "obs_valid_1_dup",
    };

    const negativeObs: ValidatedObservation = {
      ...baseObs,
      id: "obs_negative",
      locationId: "ET02",
      value: -50,
    };

    const result = runDataQualityChecks([baseObs, duplicateObs, negativeObs]);

    // Negative record rejected
    expect(result.rejectedCount).toBe(1);
    expect(result.isValid).toBe(false);
    expect(result.cleanedObservations).toHaveLength(1); // Deduplicated to 1 record
    expect(result.alerts.some((a) => a.alertCode === "IMPLAUSIBLE_SPIKE" && a.severity === "critical")).toBe(true);
    expect(result.alerts.some((a) => a.alertCode === "UNVERIFIED_ESTIMATE" && a.message.includes("Deduplicated"))).toBe(true);
  });

  it("executes runDataQualityChecks: detects conflicting values for identical composite key", () => {
    const obsA: ValidatedObservation = {
      id: "obs_key_a",
      indicatorId: "idp_stock_present",
      locationId: "ET03",
      value: 20000,
      reportingDate: "2024-08-31",
      referencePeriodType: "round",
      retrievalDate: "2026-10-22T04:15:00.000Z",
      sourceId: "iom_dtm",
      populationType: "idp",
      confidence: "medium",
    };

    const obsBConflicting: ValidatedObservation = {
      ...obsA,
      id: "obs_key_b",
      value: 25000, // Conflict!
    };

    const result = runDataQualityChecks([obsA, obsBConflicting]);

    expect(result.rejectedCount).toBe(1);
    expect(result.cleanedObservations).toHaveLength(1);
    expect(result.cleanedObservations[0].value).toBe(20000); // Preserved original
    expect(result.alerts.some((a) => a.alertCode === "CONFUSION_RISK" && a.message.includes("Conflict detected"))).toBe(true);
  });

  it("executes runDataQualityChecks: alerts on unknown P-codes and extreme outliers", () => {
    const outlierObs: ValidatedObservation = {
      id: "obs_outlier",
      indicatorId: "idp_stock_present",
      locationId: "UNKNOWN_LOCATION",
      value: 20_000_000, // >15 million spike
      reportingDate: "2024-08-31",
      referencePeriodType: "round",
      retrievalDate: "2026-10-22T04:15:00.000Z",
      sourceId: "iom_dtm",
      populationType: "idp",
      confidence: "low",
    };

    const result = runDataQualityChecks([outlierObs]);

    expect(result.alerts.some((a) => a.alertCode === "GEOGRAPHIC_MISMATCH")).toBe(true);
    expect(result.alerts.some((a) => a.alertCode === "IMPLAUSIBLE_SPIKE" && a.severity === "warning")).toBe(true);
  });
});
