import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authKey, unauthorized } from "@/lib/api/auth";
import { createCardToken } from "@/lib/tokens";

// POST /api/v1/tokens  { card }  → { token, brand, last4, … }
//
// Exchange a card for a single-use token. The PAN is never stored. Charge the
// token instead of the card so no system downstream ever handles the number —
// ideally call this straight from the browser so your own server never sees it.
const Schema = z.object({
  card: z.object({
    number: z.string().min(12).max(23),
    expMonth: z.string().min(1).max(2),
    expYear: z.string().min(2).max(4),
    cvv: z.string().min(3).max(4),
    name: z.string().optional(),
  }),
  singleUse: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const auth = await authKey(req);
  if (!auth) return unauthorized();

  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid card details" }, { status: 400 });

  const view = await createCardToken(parsed.data.card, {
    merchantId: auth.merchantId,
    mode: auth.mode,
    singleUse: parsed.data.singleUse ?? true,
  });
  return NextResponse.json({ data: view }, { status: 201 });
}
