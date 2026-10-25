import {
  getNationalProtectionMetrics,
  getRegionalIdpCaseloads,
  getDisplacementByDriver,
  getRefugeeOrigins,
} from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api";

export async function GET() {
  try {
    const nationalMetrics = getNationalProtectionMetrics();
    const regionalCaseloads = getRegionalIdpCaseloads();
    const driverBreakdown = getDisplacementByDriver();
    const refugeeOrigins = getRefugeeOrigins();

    return apiSuccess({
      nationalMetrics,
      regionalCaseloads,
      driverBreakdown,
      refugeeOrigins,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return apiError("SERVER_ERROR", message, 500);
  }
}
