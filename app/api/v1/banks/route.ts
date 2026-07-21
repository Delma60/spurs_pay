import { NextRequest, NextResponse } from "next/server";
import { authMerchant, unauthorized } from "@/lib/api/auth";
import { listBanks } from "@/lib/transfers";

// GET /api/v1/banks → banks you can pay out to
export async function GET(req: NextRequest) {
  if (!(await authMerchant(req))) return unauthorized();
  return NextResponse.json({ data: await listBanks() });
}
