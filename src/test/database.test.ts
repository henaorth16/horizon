import { describe, it, expect, beforeEach } from "vitest";
import {
  loadObservations,
  getAllObservations,
  getObservationById,
  queryObservations,
  getRegionalIdpCaseloads,
  getNationalProtectionMetrics,
  getDisplacementByDriver,
  getRefugeeOrigins,
  verifyDataIntegrity,
  reloadDatabase,
} from "@/lib/db";

describe("Local Database & Observation Repository", () => {
  beforeEach(() => {
    reloadDatabase();
  });

  it("loads and validates all processed observations from local storage", () => {
    const observations = getAllObservations();
    expect(observations.length).toBeGreaterThanOrEqual(30);

    // Verify every record has basic mandatory fields
    for (const obs of observations) {
      expect(obs.id).toBeDefined();
      expect(obs.value).toBeGreaterThanOrEqual(0);
      expect(obs.sourceId).toBeDefined();
      expect(obs.reportingDate).toMatch(/^\d{4}(-\d{2})?(-\d{2})?$/);
      expect(obs.provenance?.citation).toBeDefined();
      expect(obs.provenance?.license).toBe("CC BY 4.0");
    }
  });

  it("finds a single observation by ID", () => {
    const obs = getObservationById("dtm_r37_idp_ET01");
    expect(obs).toBeDefined();
    expect(obs?.locationId).toBe("ET01");
    expect(obs?.populationType).toBe("idp");
    expect(obs?.value).toBe(1025400);
  });

  it("queries observations with specific filters", () => {
    // Filter by populationType
    const idpOnly = queryObservations({ populationType: "idp" });
    expect(idpOnly.total).toBeGreaterThan(0);
    expect(idpOnly.data.every((r) => r.populationType === "idp")).toBe(true);

    // Filter by locationId
    const tigrayRecords = queryObservations({ locationId: "ET01" });
    expect(tigrayRecords.data.length).toBeGreaterThanOrEqual(2); // IDP, Returnee, and demographic records
    expect(tigrayRecords.data.every((r) => r.locationId === "ET01")).toBe(true);

    // Filter by driver
    const droughtRecords = queryObservations({ driver: "drought" });
    expect(droughtRecords.data.length).toBeGreaterThan(0);
    expect(droughtRecords.data.every((r) => r.breakdown?.driver === "drought")).toBe(true);

    // Sorting by value descending
    const sorted = queryObservations({
      populationType: "idp",
      sortBy: "value",
      sortDirection: "desc",
    });
    for (let i = 0; i < sorted.data.length - 1; i++) {
      expect(sorted.data[i].value).toBeGreaterThanOrEqual(sorted.data[i + 1].value);
    }
  });

  it("computes accurate regional IDP and Returnee caseloads across 12 regions", () => {
    const regional = getRegionalIdpCaseloads();
    expect(regional.length).toBe(12);

    // Tigray should be highest IDP caseload
    expect(regional[0].pcode).toBe("ET01");
    expect(regional[0].idps).toBe(1025400);
    expect(regional[0].returnees).toBe(1210000);
    expect(regional[0].primaryDriver).toBe("conflict");

    // Total regional IDPs should match sum
    const totalRegionalIdps = regional.reduce((sum, r) => sum + r.idps, 0);
    expect(totalRegionalIdps).toBe(3392200);
  });

  it("calculates national protection metrics with honest non-additive totals", () => {
    const metrics = getNationalProtectionMetrics();

    expect(metrics.totalIdps).toBe(3392200);
    expect(metrics.totalReturnees).toBe(1811400);
    expect(metrics.totalRefugees).toBe(979846);
    expect(metrics.totalAsylumSeekers).toBe(63747);

    expect(metrics.idpReportingPeriod).toBe("2024-08-31");
    expect(metrics.refugeeReportingPeriod).toBe("2023-12-31");
    expect(metrics.idpCitation).toContain("IOM");
    expect(metrics.refugeeCitation).toContain("UNHCR");
  });

  it("aggregates displacement caseload by driver", () => {
    const drivers = getDisplacementByDriver();
    expect(drivers.length).toBe(3); // Conflict, Drought, Floods

    const conflict = drivers.find((d) => d.driver === "conflict");
    expect(conflict).toBeDefined();
    expect(conflict?.totalIdps).toBeGreaterThan(2500000);
    expect(conflict?.percentage).toBeGreaterThan(70);

    const drought = drivers.find((d) => d.driver === "drought");
    expect(drought).toBeDefined();
    expect(drought?.totalIdps).toBeGreaterThan(600000);
  });

  it("breaks down hosted refugee populations by country of origin", () => {
    const origins = getRefugeeOrigins();
    expect(origins.length).toBe(4);

    expect(origins[0].originIso).toBe("SSD");
    expect(origins[0].originName).toBe("South Sudan");
    expect(origins[0].refugees).toBe(421438);

    expect(origins[1].originIso).toBe("SOM");
    expect(origins[1].originName).toBe("Somalia");
    expect(origins[1].refugees).toBe(312185);

    expect(origins[2].originIso).toBe("ERI");
    expect(origins[2].originName).toBe("Eritrea");
    expect(origins[2].refugees).toBe(168793);

    expect(origins[3].originIso).toBe("SDN");
    expect(origins[3].originName).toBe("Sudan");
    expect(origins[3].refugees).toBe(77430);
  });

  it("passes complete database integrity verification with zero errors", () => {
    const integrity = verifyDataIntegrity();
    expect(integrity.passed).toBe(true);
    expect(integrity.errorCount).toBe(0);
    expect(integrity.issues).toEqual([]);
    expect(integrity.totalRecordsChecked).toBeGreaterThanOrEqual(30);
    expect(integrity.validCount).toBe(integrity.totalRecordsChecked);
    expect(integrity.sourcesCovered).toContain("iom_dtm");
    expect(integrity.sourcesCovered).toContain("unhcr");
  });
});
