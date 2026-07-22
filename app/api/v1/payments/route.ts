import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authKey, unauthorized } from "@/lib/api/auth";
import { createPayment, publicPayment } from "@/lib/payments";
import { replayPayment, rememberKey } from "@/lib/idempotency";

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
//
// The key decides the mode: a `sk_test_…` key makes a test payment (sandbox), a
// `sk_live_…` key a live one. Send an `Idempotency-Key` header and a retried
// request returns the same payment instead of creating a second one.
export async function POST(req: NextRequest) {
  const auth = await authKey(req);
  if (!auth) return unauthorized();
  const { merchantId, mode } = auth;

  const idempotencyKey = req.headers.get("idempotency-key")?.trim() || null;
  if (idempotencyKey) {
    const existing = await replayPayment(merchantId, idempotencyKey);
    if (existing) return NextResponse.json({ data: publicPayment(existing), idempotentReplay: true });
  }

  const parsed = CreateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 });
  }

  try {
    const p = await createPayment(merchantId, { ...parsed.data, mode });
    if (idempotencyKey) await rememberKey(merchantId, idempotencyKey, p.reference);
    return NextResponse.json({ data: publicPayment(p) }, { status: 201 });
  } catch (e) {
    // Unique-reference collision → conflict.
    return NextResponse.json({ error: (e as Error).message }, { status: 409 });
  }
}
