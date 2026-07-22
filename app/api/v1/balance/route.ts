import { NextRequest, NextResponse } from "next/server";
import { authKey, unauthorized } from "@/lib/api/auth";
import { getBalance } from "@/lib/transfers";

// GET /api/v1/balance → what you've collected and what you can withdraw
export async function GET(req: NextRequest) {
  const auth = await authKey(req);
  if (!auth) return unauthorized();

  const currency = req.nextUrl.searchParams.get("currency") ?? "NGN";
  return NextResponse.json({ data: await getBalance(auth.merchantId, currency, auth.mode) });
}
