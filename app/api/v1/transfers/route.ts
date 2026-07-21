import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authMerchant, unauthorized } from "@/lib/api/auth";
import { createPayout, listPayouts, publicPayout, recipientsFor } from "@/lib/transfers";

const CreateSchema = z.object({
  recipientId: z.string().uuid(),
  amount: z.number().int().positive(), // minor units
  narration: z.string().max(200).optional(),
});

// GET /api/v1/transfers → your payouts, newest first
export async function GET(req: NextRequest) {
  const merchantId = await authMerchant(req);
  if (!merchantId) return unauthorized();

  const rows = await listPayouts(merchantId, Number(req.nextUrl.searchParams.get("limit")) || 100);
  const byId = await recipientsFor(rows);
  return NextResponse.json({ data: rows.map((p) => publicPayout(p, byId.get(p.recipientId))) });
}

// POST /api/v1/transfers { recipientId, amount, narration? } → send money out
export async function POST(req: NextRequest) {
  const merchantId = await authMerchant(req);
  if (!merchantId) return unauthorized();

  const parsed = CreateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 });
  }
  try {
    const payout = await createPayout(merchantId, parsed.data);
    return NextResponse.json({ data: publicPayout(payout) }, { status: 201 });
  } catch (e) {
    // Insufficient balance / unknown recipient → 400
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
