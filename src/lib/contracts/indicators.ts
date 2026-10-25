import { z } from "zod";
import { PopulationTypeSchema } from "./observations";

export const IndicatorUnitSchema = z.enum([
  "individuals",
  "households",
  "events",
  "percentage",
  "rate_per_1000",
  "index_score",
]);

export const AggregationMethodSchema = z.enum([
  "sum",          // e.g. IDPs across zones
  "average",      // e.g. percent female-headed
  "weighted_mean",// e.g. vulnerability index
  "latest_only",  // e.g. current stock count
  "max",          // peak caseload during period
]);

export const IndicatorDefinitionSchema = z.object({
  id: z.string().min(2),             // e.g. "idp_stock_present", "refugee_registered"
  code: z.string().min(2),           // Short alphanumeric code
  name: z.string().min(2),           // Display title
  description: z.string(),
  unit: IndicatorUnitSchema,
  populationType: PopulationTypeSchema,
  aggregationMethod: AggregationMethodSchema,
  isStock: z.boolean(),              // true = Stock count, false = Inflow/outflow
  isDemographic: z.boolean().default(false),
  isDriver: z.boolean().default(false),
  defaultSourceId: z.string().min(2),
  tags: z.array(z.string()).default([]),
});

export type IndicatorUnit = z.infer<typeof IndicatorUnitSchema>;
export type AggregationMethod = z.infer<typeof AggregationMethodSchema>;
export type IndicatorDefinition = z.infer<typeof IndicatorDefinitionSchema>;
