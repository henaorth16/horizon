import fs from "node:fs";
import path from "node:path";
import type { Topology } from "topojson-specification";

/**
 * Server-only helper to read pre-bundled administrative boundary TopoJSON files.
 */
export function getEthiopiaAdm1Topology(): Topology | null {
  try {
    const filePath = path.join(process.cwd(), "public/data/boundaries/eth-adm1.topojson");
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content) as Topology;
    }
  } catch (err) {
    console.error("Failed to load eth-adm1.topojson on server:", err);
  }
  return null;
}

export function getEthiopiaAdm2Topology(): Topology | null {
  try {
    const filePath = path.join(process.cwd(), "public/data/boundaries/eth-adm2.topojson");
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content) as Topology;
    }
  } catch (err) {
    console.error("Failed to load eth-adm2.topojson on server:", err);
  }
  return null;
}

export function getWorld110mTopology(): Topology | null {
  try {
    const filePath = path.join(process.cwd(), "public/data/boundaries/world-110m.topojson");
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content) as Topology;
    }
  } catch (err) {
    console.error("Failed to load world-110m.topojson on server:", err);
  }
  return null;
}
