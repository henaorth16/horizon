import * as topojson from "topojson-client";
import type { Topology, Objects } from "topojson-specification";
import type { FeatureCollection, Geometry } from "geojson";

export interface BoundaryFeatureProperties {
  id: string;
  name: string;
  pcode: string;
  adminLevel: number;
  altNames?: string[];
}

export type BoundaryFeatureCollection = FeatureCollection<Geometry, BoundaryFeatureProperties>;

/**
 * Standard UN OCHA Region P-Code Mapping for Ethiopian Regional States
 */
export const ETHIOPIA_REGION_PCODES: Record<string, { pcode: string; id: string; name: string }> = {
  "Tigray": { pcode: "ET01", id: "ET-TI", name: "Tigray" },
  "Afar": { pcode: "ET02", id: "ET-AF", name: "Afar" },
  "Amhara": { pcode: "ET03", id: "ET-AM", name: "Amhara" },
  "Oromia": { pcode: "ET04", id: "ET-OR", name: "Oromia" },
  "Somali": { pcode: "ET05", id: "ET-SO", name: "Somali" },
  "Beneshangul Gumu": { pcode: "ET06", id: "ET-BE", name: "Benishangul-Gumuz" },
  "Benishangul-Gumuz": { pcode: "ET06", id: "ET-BE", name: "Benishangul-Gumuz" },
  "SNNPR": { pcode: "ET07", id: "ET-SN", name: "Southern Nations (SNNPR)" },
  "Sidama": { pcode: "ET10", id: "ET-SI", name: "Sidama" },
  "Gambela": { pcode: "ET12", id: "ET-GA", name: "Gambela" },
  "Gambella": { pcode: "ET12", id: "ET-GA", name: "Gambela" },
  "Hareri": { pcode: "ET13", id: "ET-HA", name: "Harari" },
  "Harari": { pcode: "ET13", id: "ET-HA", name: "Harari" },
  "Addis Ababa": { pcode: "ET14", id: "ET-AA", name: "Addis Ababa" },
  "Dire Dawa": { pcode: "ET15", id: "ET-DD", name: "Dire Dawa" },
};

/**
 * Decodes a TopoJSON topology into a standardized GeoJSON FeatureCollection.
 */
export function decodeTopojson(
  topology: Topology,
  objectKey?: string
): FeatureCollection<Geometry, BoundaryFeatureProperties> {
  const keys = Object.keys(topology.objects);
  const targetKey = objectKey || keys[0];

  if (!targetKey || !topology.objects[targetKey]) {
    throw new Error(`Object key "${targetKey}" not found in TopoJSON topology`);
  }

  // Convert via topojson-client
  const geojson = topojson.feature(
    topology,
    topology.objects[targetKey]
  ) as unknown as FeatureCollection<Geometry, Record<string, unknown>>;

  // Normalize properties to standard BoundaryFeatureProperties
  const normalizedFeatures = geojson.features.map((feature, index) => {
    const rawName = (feature.properties?.shapeName || feature.properties?.name || `Feature_${index}`) as string;
    const shapeType = feature.properties?.shapeType as string | undefined;
    const adminLevel = shapeType === "ADM0" ? 0 : shapeType === "ADM2" ? 2 : 1;

    // Resolve P-code and normalized name
    const mapped = ETHIOPIA_REGION_PCODES[rawName];
    const pcode = mapped?.pcode || (feature.properties?.shapeISO as string) || `ET_ADM_${index}`;
    const id = mapped?.id || pcode;
    const name = mapped?.name || rawName;

    return {
      ...feature,
      properties: {
        id,
        name,
        pcode,
        adminLevel,
        altNames: rawName !== name ? [rawName] : [],
      },
    };
  });

  return {
    type: "FeatureCollection",
    features: normalizedFeatures,
  };
}
