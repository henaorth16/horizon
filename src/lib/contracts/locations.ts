import { z } from "zod";

export const AdminLevelSchema = z.union([
  z.literal(0), // National / Country
  z.literal(1), // Region (e.g. Tigray, Oromia, Somali)
  z.literal(2), // Zone (e.g. East Hararghe, Doolo, North Gondar)
  z.literal(3), // Woreda / District
]);

export const CoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const BoundingBoxSchema = z.tuple([
  z.number().min(-180).max(180), // minX / westLng
  z.number().min(-90).max(90),   // minY / southLat
  z.number().min(-180).max(180), // maxX / eastLng
  z.number().min(-90).max(90),   // maxY / northLat
]);

export const LocationHierarchySchema = z.object({
  id: z.string().min(2),             // Standardized code e.g. "ET", "ET04", "ET0401"
  pcode: z.string().optional(),      // UN OCHA Common Operational Dataset P-Code
  code: z.string().optional(),       // Alternative code alias
  name: z.string().min(1),           // Primary English name
  nameAmharic: z.string().optional(),// Amharic script name
  altNames: z.array(z.string()).default([]),
  adminLevel: AdminLevelSchema,
  parentId: z.string().nullable().optional(),
  iso3: z.string().length(3).default("ETH"),
  centroid: CoordinatesSchema.optional(),
  bbox: BoundingBoxSchema.optional(),
  status: z.enum(["active", "historical", "disputed"]).default("active"),
});

export const LocationSchema = LocationHierarchySchema;

export type AdminLevel = z.infer<typeof AdminLevelSchema>;
export type Coordinates = z.infer<typeof CoordinatesSchema>;
export type BoundingBox = z.infer<typeof BoundingBoxSchema>;
export type LocationRecord = z.infer<typeof LocationHierarchySchema>;
export type ValidatedLocation = LocationRecord;
