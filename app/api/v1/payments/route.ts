import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authMerchant, unauthorized } from "@/lib/api/auth";
import { createPayment, publicPayment } from "@/lib/payments";

const CreateSchema = z.object({
  amount: z.number().int().positive(), // minor units
  currency: z.string().length(3).optional(),
  customerEmail: z.string().email().optional(),
  description: z.string().max(500).optional(),
  callbackUrl: z.string().url().optional(),
  reference: z.string().min(3).max(100).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// POST /api/v1/payments  → initialize a payment, returns { checkoutUrl, reference, ... }
export async function POST(req: NextRequest) {
  const merchantId = await authMerchant(req);
  if (!merchantId) return unauthorized();

  const parsed = CreateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 });
  }

  try {
    const p = await createPayment(merchantId, parsed.data);
    return NextResponse.json({ data: publicPayment(p) }, { status: 201 });
  } catch (e) {
    // Unique-reference collision → idempotency-style conflict.
    return NextResponse.json({ error: (e as Error).message }, { status: 409 });
  }
}
