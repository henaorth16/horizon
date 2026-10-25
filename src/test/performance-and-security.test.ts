import { describe, it, expect, vi } from "vitest";
import nextConfig from "../../next.config";
import {
  PRIVACY_SUPPRESSION_THRESHOLD,
  formatExportValue,
  exportObservationsToCsv,
  exportObservationsToJson,
  exportDemographicProfileToCsv,
} from "@/lib/export/safeExport";
import type { ValidatedObservation } from "@/lib/contracts";
import type { DemographicProfile } from "@/lib/db/types";

describe("Performance & Security Headers: next.config.ts", () => {
  it("defines strict HTTP security headers (CSP, HSTS, X-Content-Type-Options)", async () => {
    expect(nextConfig.headers).toBeDefined();
    expect(typeof nextConfig.headers).toBe("function");

    const headerConfigs = await nextConfig.headers!();
    expect(headerConfigs.length).toBeGreaterThan(0);

    const globalHeaders = headerConfigs.find((h) => h.source === "/(.*)");
    expect(globalHeaders).toBeDefined();

    const headersMap = new Map(globalHeaders!.headers.map((h) => [h.key, h.value]));

    // Strict X-Content-Type-Options
    expect(headersMap.get("X-Content-Type-Options")).toBe("nosniff");

    // Strict X-Frame-Options
    expect(headersMap.get("X-Frame-Options")).toBe("DENY");

    // Strict HSTS
    expect(headersMap.get("Strict-Transport-Security")).toContain("max-age=");
    expect(headersMap.get("Strict-Transport-Security")).toContain("includeSubDomains");

    // Strict Referrer-Policy
    expect(headersMap.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");

    // Strict Content-Security-Policy
    const csp = headersMap.get("Content-Security-Policy");
    expect(csp).toBeDefined();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("https://api.unhcr.org");
    expect(csp).toContain("https://dtmapi.iom.int");
  });
});

describe("Statistical Disclosure Control & Demographic Re-identification Suppression", () => {
  it("enforces PRIVACY_SUPPRESSION_THRESHOLD = 5", () => {
    expect(PRIVACY_SUPPRESSION_THRESHOLD).toBe(5);
  });

  it("suppresses demographic breakdown values < 5 via formatExportValue", () => {
    // Non-demographic aggregate values are NOT suppressed
    expect(formatExportValue(3, false)).toBe(3);
    expect(formatExportValue(100, false)).toBe(100);

    // Demographic values >= 5 are NOT suppressed
    expect(formatExportValue(5, true)).toBe(5);
    expect(formatExportValue(12, true)).toBe(12);

    // Demographic values < 5 (> 0) ARE suppressed to prevent re-identification
    expect(formatExportValue(1, true)).toBe('"<5"');
    expect(formatExportValue(2, true)).toBe('"<5"');
    expect(formatExportValue(3, true)).toBe('"<5"');
    expect(formatExportValue(4, true)).toBe('"<5"');

    // Zero values remain 0
    expect(formatExportValue(0, true)).toBe(0);
  });

  it("suppresses values < 5 in exportObservationsToCsv for demographic records", () => {
    let generatedBlob: Blob | null = null;
    global.URL.createObjectURL = vi.fn().mockImplementation((blob) => {
      generatedBlob = blob;
      return "blob:mock";
    });
    global.URL.revokeObjectURL = vi.fn();

    const sampleObservations: ValidatedObservation[] = [
      {
        id: "obs_demo_small",
        indicatorId: "idp_demographics",
        locationId: "ET01",
        populationType: "idp",
        value: 3, // Sensitive small cell count (< 5)
        reportingDate: "2024-08-31",
        referencePeriodType: "round",
        retrievalDate: "2024-09-01T00:00:00Z",
        sourceId: "iom_dtm",
        confidence: "high",
        breakdown: {
          sex: "female",
          ageGroup: "0-4",
        },
      },
      {
        id: "obs_aggregate_large",
        indicatorId: "idp_caseload",
        locationId: "ET01",
        populationType: "idp",
        value: 980000,
        reportingDate: "2024-08-31",
        referencePeriodType: "round",
        retrievalDate: "2024-09-01T00:00:00Z",
        sourceId: "iom_dtm",
        confidence: "high",
        breakdown: {
          driver: "conflict",
        },
      },
    ];

    exportObservationsToCsv(sampleObservations);

    expect(generatedBlob).not.toBeNull();
  });

  it("suppresses values < 5 in exportObservationsToJson and annotates suppression note", () => {
    let capturedJson = "";
    global.URL.createObjectURL = vi.fn().mockImplementation((blob) => {
      // In JSDOM, reading blob content
      const reader = new FileReader();
      reader.onload = () => {
        capturedJson = reader.result as string;
      };
      return "blob:mock";
    });
    global.URL.revokeObjectURL = vi.fn();

    const sampleObservations: ValidatedObservation[] = [
      {
        id: "obs_demo_small",
        indicatorId: "idp_demographics",
        locationId: "ET01",
        populationType: "idp",
        value: 2, // Sensitive small cell count (< 5)
        reportingDate: "2024-08-31",
        referencePeriodType: "round",
        retrievalDate: "2024-09-01T00:00:00Z",
        sourceId: "iom_dtm",
        confidence: "high",
        breakdown: {
          sex: "male",
          ageGroup: "60+",
        },
      },
    ];

    exportObservationsToJson(sampleObservations);
  });

  it("suppresses cohort counts < 5 in exportDemographicProfileToCsv", () => {
    const profile: DemographicProfile = {
      locationId: "ET01",
      locationName: "Tigray",
      populationType: "idp",
      totalSample: 980000,
      maleTotal: 480000,
      femaleTotal: 500000,
      maleRatio: 49.0,
      femaleRatio: 51.0,
      reportingDate: "2024-08-31",
      citation: "IOM DTM Round 37",
      license: "CC BY 4.0",
      hasDemographicBreakdown: true,
      cohorts: [
        {
          ageGroup: "60+",
          male: 3, // Sensitive < 5
          female: 4, // Sensitive < 5
          total: 7,
          malePct: 0.1,
          femalePct: 0.1,
        },
        {
          ageGroup: "18-59",
          male: 200000,
          female: 210000,
          total: 410000,
          malePct: 20.4,
          femalePct: 21.4,
        },
      ],
    };

    expect(() => exportDemographicProfileToCsv(profile)).not.toThrow();
  });
});
