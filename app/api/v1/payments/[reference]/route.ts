import { NextRequest, NextResponse } from "next/server";
import { authMerchant, unauthorized } from "@/lib/api/auth";
import { getPayment, publicPayment } from "@/lib/payments";

// GET /api/v1/payments/<reference>  → verify/poll a payment's status
export async function GET(req: NextRequest, { params }: { params: Promise<{ reference: string }> }) {
  const merchantId = await authMerchant(req);
  if (!merchantId) return unauthorized();

  const { reference } = await params;
  const p = await getPayment(reference);
  if (!p || p.merchantId !== merchantId) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }
  return NextResponse.json({ data: publicPayment(p) });
}
