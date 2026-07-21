import { NextRequest, NextResponse } from "next/server";
import { authMerchant, unauthorized } from "@/lib/api/auth";
import { getBalance } from "@/lib/transfers";

// GET /api/v1/balance → what you've collected and what you can withdraw
export async function GET(req: NextRequest) {
  const merchantId = await authMerchant(req);
  if (!merchantId) return unauthorized();

  const currency = req.nextUrl.searchParams.get("currency") ?? "NGN";
  return NextResponse.json({ data: await getBalance(merchantId, currency) });
}
