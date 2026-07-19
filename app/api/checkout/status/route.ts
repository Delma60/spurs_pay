import { NextRequest, NextResponse } from "next/server";
import { getPayment, paymentInstructions } from "@/lib/payments";

// Public status poll for the hosted checkout (the reference is the secret).
// Used by the bank-transfer / USSD panels to detect settlement.
export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");
  if (!reference) return NextResponse.json({ error: "Missing reference" }, { status: 400 });

  const payment = await getPayment(reference);
  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

  return NextResponse.json({
    status: payment.status,
    method: payment.method,
    instructions: paymentInstructions(payment),
  });
}
