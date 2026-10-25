import { describe, it, expect } from "vitest";
import { z } from "zod";
import * as d3Scale from "d3-scale";

describe("Stack Verification", () => {
  it("validates data using Zod", () => {
    const LocationSchema = z.object({
      id: z.string(),
      name: z.string(),
      adminLevel: z.number().int().min(0).max(3),
    });

    const parsed = LocationSchema.parse({
      id: "ET",
      name: "Ethiopia",
      adminLevel: 0,
    });

    expect(parsed.name).toBe("Ethiopia");
  });

  it("calculates scales with modular D3", () => {
    const scale = d3Scale.scaleLinear().domain([0, 100]).range([0, 1000]);
    expect(scale(50)).toBe(500);
  });
});
