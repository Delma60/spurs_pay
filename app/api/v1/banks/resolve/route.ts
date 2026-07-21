import { NextRequest, NextResponse } from "next/server";
import { authMerchant, unauthorized } from "@/lib/api/auth";
import { resolveAccount } from "@/lib/transfers";

// GET /api/v1/banks/resolve?bankCode=044&accountNumber=0123456789
// Always confirm the account name with the customer before paying out.
export async function GET(req: NextRequest) {
  if (!(await authMerchant(req))) return unauthorized();

  const bankCode = req.nextUrl.searchParams.get("bankCode");
  const accountNumber = req.nextUrl.searchParams.get("accountNumber");
  if (!bankCode || !accountNumber) {
    return NextResponse.json({ error: "bankCode and accountNumber are required" }, { status: 400 });
  }

  try {
    const resolved = await resolveAccount(bankCode, accountNumber);
    if (!resolved) return NextResponse.json({ error: "Could not resolve that account" }, { status: 404 });
    return NextResponse.json({ data: resolved });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
