import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authorizeInternalService } from "@/lib/api/internal-guard";
import { ensureMerchant } from "@/lib/merchants";
import { createPayment, getPayment, publicPayment } from "@/lib/payments";

// Private service API for trusted Spurs services (baas Billing).
// Lets billing raise a charge against any Spurs user without a merchant key.
const CreateSchema = z.object({
  merchant: z.string().min(1),            // Spurs user id (accounts `sub`)
  businessName: z.string().min(1).optional(),
  amount: z.number().int().positive(),
  currency: z.string().length(3).optional(),
  customerEmail: z.string().email().optional(),
  description: z.string().max(500).optional(),
  reference: z.string().min(3).max(100).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// POST /api/private/payments  → create a payment on behalf of a Spurs user
export async function POST(req: NextRequest) {
  const auth = authorizeInternalService(req);
  if (!auth.ok) return auth.error;

  const parsed = CreateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 });
  }
  const { merchant, businessName, ...input } = parsed.data;

  try {
    // Make sure the merchant exists (idempotent) before charging them.
    await ensureMerchant(merchant, businessName ?? "Spurs user");
    // Trusted first-party services (billing, wallet, cloud) move real money.
    const p = await createPayment(merchant, { ...input, mode: "live" });
    return NextResponse.json({ data: publicPayment(p) }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 409 });
  }
}

// GET /api/private/payments?reference=<ref>  → look up any payment
export async function GET(req: NextRequest) {
  const auth = authorizeInternalService(req);
  if (!auth.ok) return auth.error;

  const reference = req.nextUrl.searchParams.get("reference");
  if (!reference) return NextResponse.json({ error: "Missing reference" }, { status: 400 });

  const p = await getPayment(reference);
  if (!p) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  return NextResponse.json({ data: publicPayment(p) });
}
