import { NextRequest, NextResponse } from "next/server";
import { authMerchant, unauthorized } from "@/lib/api/auth";
import { getPayout, getRecipient, publicPayout } from "@/lib/transfers";

// GET /api/v1/transfers/<reference> → check a payout's status
export async function GET(req: NextRequest, { params }: { params: Promise<{ reference: string }> }) {
  const merchantId = await authMerchant(req);
  if (!merchantId) return unauthorized();

  const { reference } = await params;
  const payout = await getPayout(reference);
  if (!payout || payout.merchantId !== merchantId) {
    return NextResponse.json({ error: "Payout not found" }, { status: 404 });
  }
  const recipient = await getRecipient(merchantId, payout.recipientId);
  return NextResponse.json({ data: publicPayout(payout, recipient ?? undefined) });
}
