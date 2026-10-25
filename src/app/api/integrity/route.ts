import { verifyDataIntegrity } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api";

export async function GET() {
  try {
    const report = verifyDataIntegrity();
    return apiSuccess(report);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return apiError("SERVER_ERROR", message, 500);
  }
}
