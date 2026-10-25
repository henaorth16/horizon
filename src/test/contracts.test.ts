import { describe, it, expect } from "vitest";
import {
  DataSourceSchema,
  DatasetSnapshotSchema,
  IngestionRunSchema,
  LocationHierarchySchema,
  CoordinatesSchema,
  BoundingBoxSchema,
  IndicatorDefinitionSchema,
  ObservationSchema,
  DemographicBreakdownSchema,
  QualityAlertSchema,
  ProvenanceRecordSchema,
} from "@/lib/contracts";

describe("Data Contracts: DataSource & Snapshot Schemas", () => {
  it("validates a compliant DataSource schema", () => {
    const valid = DataSourceSchema.parse({
      id: "iom_dtm",
      name: "IOM Displacement Tracking Matrix Ethiopia",
      organization: "International Organization for Migration",
      mandate: "Internal Displacement Monitoring",
      homepageUrl: "https://dtm.iom.int/ethiopia",
      license: "CC BY 4.0",
      attributionText: "Source: International Organization for Migration (IOM) DTM Ethiopia",
      cadence: "bimonthly",
    });

    expect(valid.id).toBe("iom_dtm");
    expect(valid.active).toBe(true);
    expect(valid.attributionRequired).toBe(true);
  });

  it("rejects DataSource with invalid homepage URL", () => {
    expect(() =>
      DataSourceSchema.parse({
        id: "bad_url_source",
        name: "Invalid URL Source",
        organization: "Test Org",
        mandate: "Testing",
        homepageUrl: "not-a-valid-url",
        license: "CC BY 4.0",
        attributionText: "Source: Test",
        cadence: "monthly",
      })
    ).toThrow();
  });

  it("validates a compliant DatasetSnapshot schema", () => {
    const valid = DatasetSnapshotSchema.parse({
      id: "snap_dtm_r37_20240831",
      sourceId: "iom_dtm",
      versionLabel: "Round 37",
      snapshotDate: "2024-08-31",
      retrievalTimestamp: "2026-10-22T04:00:00.000Z",
      rawFilePath: "data/raw/iom_dtm/round_37.csv",
      rawFormat: "csv",
      checksumSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      byteSize: 1420500,
      recordCount: 8420,
      status: "validated",
    });

    expect(valid.checksumSha256).toHaveLength(64);
    expect(valid.recordCount).toBe(8420);
  });

  it("rejects an invalid SHA-256 checksum length", () => {
    expect(() =>
      DatasetSnapshotSchema.parse({
        id: "snap_invalid",
        sourceId: "iom_dtm",
        versionLabel: "Round 1",
        snapshotDate: "2024-01-01",
        retrievalTimestamp: "2026-10-22T04:00:00.000Z",
        rawFilePath: "data/raw/test.csv",
        rawFormat: "csv",
        checksumSha256: "short_hash", // Invalid length
        byteSize: 100,
        recordCount: 10,
        status: "validated",
      })
    ).toThrow();
  });

  it("validates IngestionRunSchema for pipeline execution logs", () => {
    const run = IngestionRunSchema.parse({
      id: "run_dtm_r37_01",
      snapshotId: "snap_dtm_r37_20240831",
      sourceId: "iom_dtm",
      startedAt: "2026-10-22T04:00:00.000Z",
      completedAt: "2026-10-22T04:01:15.000Z",
      status: "success",
      rowsRead: 8420,
      rowsValid: 8418,
      rowsRejected: 2,
      errorSummary: ["Row 402: missing pcode", "Row 810: negative count"],
    });

    expect(run.status).toBe("success");
    expect(run.rowsRead).toBe(run.rowsValid + run.rowsRejected);
  });
});

describe("Data Contracts: Location & Geography Schemas", () => {
  it("validates national, regional, and zonal locations", () => {
    const national = LocationHierarchySchema.parse({
      id: "ET",
      pcode: "ET",
      name: "Ethiopia",
      adminLevel: 0,
    });
    expect(national.adminLevel).toBe(0);

    const regional = LocationHierarchySchema.parse({
      id: "ET01",
      pcode: "ET01",
      name: "Tigray",
      nameAmharic: "ትግራይ",
      adminLevel: 1,
      parentId: "ET",
      centroid: { latitude: 14.0323, longitude: 38.3166 },
    });
    expect(regional.parentId).toBe("ET");
    expect(regional.centroid?.latitude).toBeCloseTo(14.0323);
  });

  it("validates CoordinatesSchema and BoundingBoxSchema", () => {
    const coords = CoordinatesSchema.parse({
      latitude: 9.145,
      longitude: 40.489673,
    });
    expect(coords.latitude).toBe(9.145);

    const bbox = BoundingBoxSchema.parse([32.9999, 3.4024, 47.9862, 14.8913]);
    expect(bbox[0]).toBe(32.9999);
    expect(bbox[3]).toBe(14.8913);
  });

  it("rejects invalid coordinate bounds", () => {
    expect(() =>
      LocationHierarchySchema.parse({
        id: "ET_ERR",
        pcode: "ET_ERR",
        name: "Invalid Coordinates",
        adminLevel: 1,
        centroid: { latitude: 120.0, longitude: 40.0 }, // Latitude > 90
      })
    ).toThrow();
  });
});

describe("Data Contracts: Indicator Schema", () => {
  it("validates indicator definitions", () => {
    const indicator = IndicatorDefinitionSchema.parse({
      id: "idp_stock_present",
      code: "IND_IDP_01",
      name: "Present IDP Caseload",
      description: "Count of internally displaced persons residing in assessment locations",
      unit: "individuals",
      populationType: "idp",
      aggregationMethod: "sum",
      isStock: true,
      defaultSourceId: "iom_dtm",
    });

    expect(indicator.isStock).toBe(true);
    expect(indicator.aggregationMethod).toBe("sum");
  });
});

describe("Data Contracts: Observation, Provenance & Quality Alerts", () => {
  it("validates complete Observation with separate reference and retrieval dates", () => {
    const obs = ObservationSchema.parse({
      id: "obs_dtm_r37_et01",
      indicatorId: "idp_stock_present",
      locationId: "ET01",
      value: 1025400,
      reportingDate: "2024-08-31", // Reference Date
      referencePeriodType: "round",
      retrievalDate: "2026-10-22T04:15:00.000Z", // Ingestion Date
      sourceId: "iom_dtm",
      populationType: "idp",
      confidence: "medium",
      breakdown: {
        driver: "conflict",
        sex: "female",
        ageGroup: "18-59",
      },
      provenance: {
        sourceId: "iom_dtm",
        sourceName: "IOM DTM Ethiopia",
        datasetSnapshotId: "snap_dtm_r37_20240831",
        retrievalTimestamp: "2026-10-22T04:15:00.000Z",
        license: "CC BY 4.0",
        citation: "IOM Ethiopia Displacement Tracking Matrix Site Assessment Round 37",
      },
    });

    expect(obs.reportingDate).toBe("2024-08-31");
    expect(obs.retrievalDate).toBe("2026-10-22T04:15:00.000Z");
    expect(obs.value).toBe(1025400);
  });

  it("validates DemographicBreakdownSchema with driver and householdType", () => {
    const breakdown = DemographicBreakdownSchema.parse({
      sex: "female",
      ageGroup: "0-4",
      driver: "drought",
      originLocationId: "ET05",
      destinationLocationId: "ET04",
      householdType: "female_headed",
    });

    expect(breakdown.sex).toBe("female");
    expect(breakdown.driver).toBe("drought");
    expect(breakdown.householdType).toBe("female_headed");
  });

  it("validates QualityAlert schema", () => {
    const alert = QualityAlertSchema.parse({
      id: "alert_001",
      alertCode: "CONFUSION_RISK",
      severity: "warning",
      locationId: "ET",
      indicatorId: "combined_total",
      message: "IDP counts from IOM DTM and Refugee counts from UNHCR cannot be summed.",
      timestamp: "2026-10-22T04:15:00.000Z",
    });

    expect(alert.severity).toBe("warning");
    expect(alert.alertCode).toBe("CONFUSION_RISK");
  });

  it("rejects observations with negative counts", () => {
    expect(() =>
      ObservationSchema.parse({
        id: "obs_err",
        indicatorId: "idp_stock",
        locationId: "ET",
        value: -100, // Negative count
        reportingDate: "2024-01-01",
        retrievalDate: "2026-10-22T04:15:00.000Z",
        sourceId: "iom_dtm",
        populationType: "idp",
      })
    ).toThrow();
  });

  it("rejects observations with non-standard date formats", () => {
    expect(() =>
      ObservationSchema.parse({
        id: "obs_err_date",
        indicatorId: "idp_stock",
        locationId: "ET",
        value: 500,
        reportingDate: "31/08/2024", // Invalid format (not YYYY, YYYY-MM, or YYYY-MM-DD)
        retrievalDate: "2026-10-22T04:15:00.000Z",
        sourceId: "iom_dtm",
        populationType: "idp",
      })
    ).toThrow();
  });
});
