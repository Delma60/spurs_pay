import { NextRequest, NextResponse } from "next/server";
import { authorizeInternalService } from "@/lib/api/internal-guard";
import { processDueDeliveries } from "@/lib/webhooks";

// POST /api/private/webhooks/process
// Retries every webhook delivery whose backoff is due. Meant to be poked by a
// scheduler (cron) every minute. Trusted Spurs services only.
export async function POST(req: NextRequest) {
  const auth = authorizeInternalService(req);
  if (!auth.ok) return auth.error;

  const processed = await processDueDeliveries(100);
  return NextResponse.json({ processed });
}
