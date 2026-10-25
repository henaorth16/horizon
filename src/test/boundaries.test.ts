import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import * as topojson from "topojson-client";
import type { Topology } from "topojson-specification";
import { decodeTopojson, ETHIOPIA_REGION_PCODES } from "@/lib/geo/boundaries";

describe("Geographic Boundaries & Cartographic Assets", () => {
  const boundariesDir = path.resolve(process.cwd(), "public/data/boundaries");

  it("loads and validates Ethiopia Admin 0 national border TopoJSON", () => {
    const filePath = path.join(boundariesDir, "eth-adm0.topojson");
    expect(fs.existsSync(filePath)).toBe(true);

    const raw = JSON.parse(fs.readFileSync(filePath, "utf-8")) as Topology;
    expect(raw.type).toBe("Topology");

    const decoded = decodeTopojson(raw);
    expect(decoded.type).toBe("FeatureCollection");
    expect(decoded.features.length).toBe(1);
    expect(decoded.features[0].properties.adminLevel).toBe(0);
  });

  it("loads and decodes Ethiopia Admin 1 regional states TopoJSON with P-codes", () => {
    const filePath = path.join(boundariesDir, "eth-adm1.topojson");
    expect(fs.existsSync(filePath)).toBe(true);

    const raw = JSON.parse(fs.readFileSync(filePath, "utf-8")) as Topology;
    const decoded = decodeTopojson(raw);

    expect(decoded.type).toBe("FeatureCollection");
    expect(decoded.features.length).toBeGreaterThanOrEqual(11);

    // Verify key regional states exist with standardized P-codes
    const pcodes = decoded.features.map((f) => f.properties.pcode);
    expect(pcodes).toContain("ET01"); // Tigray
    expect(pcodes).toContain("ET02"); // Afar
    expect(pcodes).toContain("ET03"); // Amhara
    expect(pcodes).toContain("ET04"); // Oromia
    expect(pcodes).toContain("ET05"); // Somali

    const tigrayFeature = decoded.features.find((f) => f.properties.pcode === "ET01");
    expect(tigrayFeature?.properties.name).toBe("Tigray");
    expect(tigrayFeature?.properties.id).toBe("ET-TI");
    expect(tigrayFeature?.properties.adminLevel).toBe(1);
  });

  it("loads and decodes Ethiopia Admin 2 zonal boundaries TopoJSON", () => {
    const filePath = path.join(boundariesDir, "eth-adm2.topojson");
    expect(fs.existsSync(filePath)).toBe(true);

    const raw = JSON.parse(fs.readFileSync(filePath, "utf-8")) as Topology;
    const decoded = decodeTopojson(raw);

    expect(decoded.type).toBe("FeatureCollection");
    expect(decoded.features.length).toBeGreaterThanOrEqual(70);

    const sampleZone = decoded.features[0];
    expect(sampleZone.geometry).toBeDefined();
    expect(sampleZone.properties.name).toBeDefined();
    expect(sampleZone.properties.adminLevel).toBe(2);
  });

  it("loads and decodes World 110m boundaries TopoJSON for 3D Globe", () => {
    const filePath = path.join(boundariesDir, "world-110m.topojson");
    expect(fs.existsSync(filePath)).toBe(true);

    const raw = JSON.parse(fs.readFileSync(filePath, "utf-8")) as Topology;
    expect(raw.objects.countries).toBeDefined();

    const countries = topojson.feature(raw, raw.objects.countries) as unknown as {
      type: string;
      features: unknown[];
    };
    expect(countries.type).toBe("FeatureCollection");
    expect(countries.features.length).toBeGreaterThan(150);
  });

  it("ensures P-code mapping dictionary covers all standard regions", () => {
    expect(ETHIOPIA_REGION_PCODES["Tigray"].pcode).toBe("ET01");
    expect(ETHIOPIA_REGION_PCODES["Amhara"].pcode).toBe("ET03");
    expect(ETHIOPIA_REGION_PCODES["Oromia"].pcode).toBe("ET04");
    expect(ETHIOPIA_REGION_PCODES["Somali"].pcode).toBe("ET05");
    expect(ETHIOPIA_REGION_PCODES["Addis Ababa"].pcode).toBe("ET14");
    expect(ETHIOPIA_REGION_PCODES["Dire Dawa"].pcode).toBe("ET15");
  });
});
