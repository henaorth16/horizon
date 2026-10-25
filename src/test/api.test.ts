import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as getObservations } from "@/app/api/observations/route";
import { GET as getIndicators } from "@/app/api/indicators/route";
import { GET as getLocations } from "@/app/api/locations/route";
import { GET as getSources } from "@/app/api/sources/route";
import { GET as getMetrics } from "@/app/api/metrics/route";
import { GET as getIntegrity } from "@/app/api/integrity/route";
import { GET as getMetadata } from "@/app/api/metadata/route";
import { reloadDatabase } from "@/lib/db";

function createMockRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3000"));
}

describe("Backend API Layer: /api/observations", () => {
  beforeEach(() => {
    reloadDatabase();
  });

  it("returns default paginated observations with standard envelope and cache headers", async () => {
    const req = createMockRequest("http://localhost:3000/api/observations");
    const res = await getObservations(req);
    expect(res.status).toBe(200);

    const cacheHeader = res.headers.get("Cache-Control");
    expect(cacheHeader).toContain("s-maxage=3600");

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThanOrEqual(30);
    expect(json.meta.total).toBeGreaterThanOrEqual(30);
    expect(json.meta.limit).toBe(50);
    expect(json.meta.offset).toBe(0);
    expect(typeof json.meta.hasMore).toBe("boolean");
  });

  it("filters observations strictly by populationType", async () => {
    const req = createMockRequest("http://localhost:3000/api/observations?populationType=refugee");
    const res = await getObservations(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
    expect(json.data.every((r: any) => r.populationType === "refugee")).toBe(true);
  });

  it("filters observations by locationId (P-code)", async () => {
    const req = createMockRequest("http://localhost:3000/api/observations?locationId=ET01");
    const res = await getObservations(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.length).toBeGreaterThanOrEqual(2); // IDP, Returnee, and demographic records
    expect(json.data.every((r: any) => r.locationId === "ET01")).toBe(true);
  });

  it("filters observations by primary trigger driver", async () => {
    const req = createMockRequest("http://localhost:3000/api/observations?driver=drought");
    const res = await getObservations(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
    expect(json.data.every((r: any) => r.breakdown?.driver === "drought")).toBe(true);
  });

  it("supports single observation lookup by ID", async () => {
    const req = createMockRequest("http://localhost:3000/api/observations?id=dtm_r37_idp_ET01");
    const res = await getObservations(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.id).toBe("dtm_r37_idp_ET01");
    expect(json.data.value).toBe(1025400);
  });

  it("returns 404 when requested observation ID does not exist", async () => {
    const req = createMockRequest("http://localhost:3000/api/observations?id=non_existent_id");
    const res = await getObservations(req);
    expect(res.status).toBe(404);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("NOT_FOUND");
  });

  it("returns 400 Bad Request when invalid populationType is supplied", async () => {
    const req = createMockRequest("http://localhost:3000/api/observations?populationType=invented_type");
    const res = await getObservations(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("INVALID_QUERY_PARAMS");
    expect(json.error.details).toBeDefined();
  });

  it("returns 400 Bad Request when limit exceeds maximum of 500", async () => {
    const req = createMockRequest("http://localhost:3000/api/observations?limit=999");
    const res = await getObservations(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("INVALID_QUERY_PARAMS");
  });

  it("supports pagination slicing and reports hasMore correctly", async () => {
    const req = createMockRequest("http://localhost:3000/api/observations?limit=5&offset=0");
    const res = await getObservations(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data.length).toBe(5);
    expect(json.meta.limit).toBe(5);
    expect(json.meta.offset).toBe(0);
    expect(json.meta.hasMore).toBe(true);
  });
});

describe("Backend API Layer: /api/indicators", () => {
  it("returns canonical indicators with observation counts", async () => {
    const req = createMockRequest("http://localhost:3000/api/indicators");
    const res = await getIndicators(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.length).toBeGreaterThanOrEqual(4);

    const idp = json.data.find((i: any) => i.id === "idp_stock");
    expect(idp).toBeDefined();
    expect(idp.observationCount).toBeGreaterThan(0);
  });

  it("filters indicators by populationType", async () => {
    const req = createMockRequest("http://localhost:3000/api/indicators?populationType=refugee");
    const res = await getIndicators(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.every((i: any) => i.populationType === "refugee")).toBe(true);
  });

  it("rejects invalid indicator query parameter with 400", async () => {
    const req = createMockRequest("http://localhost:3000/api/indicators?populationType=invalid");
    const res = await getIndicators(req);
    expect(res.status).toBe(400);
  });
});

describe("Backend API Layer: /api/locations", () => {
  it("returns all locations including Admin 0 and Admin 1 regional states", async () => {
    const req = createMockRequest("http://localhost:3000/api/locations");
    const res = await getLocations(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.length).toBe(13); // 1 national + 12 regions
  });

  it("filters locations by adminLevel=1 (regional states only)", async () => {
    const req = createMockRequest("http://localhost:3000/api/locations?adminLevel=1");
    const res = await getLocations(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data.length).toBe(12);
    expect(json.data.every((l: any) => l.adminLevel === 1)).toBe(true);
  });

  it("searches locations by name or alternative alias", async () => {
    const req = createMockRequest("http://localhost:3000/api/locations?search=Tigray");
    const res = await getLocations(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data.length).toBe(1);
    expect(json.data[0].pcode).toBe("ET01");
  });
});

describe("Backend API Layer: /api/sources", () => {
  it("returns verified sources with mandates and observation counts", async () => {
    const req = createMockRequest("http://localhost:3000/api/sources");
    const res = await getSources(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.length).toBeGreaterThanOrEqual(5);

    const dtm = json.data.find((s: any) => s.id === "iom_dtm");
    expect(dtm).toBeDefined();
    expect(dtm.license).toBe("CC BY 4.0");
    expect(dtm.observationCount).toBeGreaterThan(0);
  });
});

describe("Backend API Layer: /api/metrics, /api/integrity, and /api/metadata", () => {
  it("returns top-level metrics envelope on /api/metrics", async () => {
    const res = await getMetrics();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.nationalMetrics.totalIdps).toBe(3392200);
    expect(json.data.regionalCaseloads.length).toBe(12);
  });

  it("returns clean audit status on /api/integrity", async () => {
    const res = await getIntegrity();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.passed).toBe(true);
    expect(json.data.errorCount).toBe(0);
  });

  it("returns catalog metadata, version, and endpoints list on /api/metadata", async () => {
    const res = await getMetadata();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.observatory.version).toBe("1.0.0");
    expect(json.data.databaseStats.totalObservations).toBeGreaterThanOrEqual(30);
    expect(json.data.availableEndpoints.length).toBe(7);
  });
});
