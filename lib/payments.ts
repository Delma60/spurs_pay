import { db, payments, type Payment } from "@/lib/db";
import { eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import type { Instructions, PaymentMethod } from "@/lib/providers/types";

export interface CreatePaymentInput {
  amount: number; // minor units
  currency?: string;
  customerEmail?: string;
  description?: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
  reference?: string; // merchant-supplied idempotent ref; generated if absent
}

/** The shape returned to merchants/customers — never leaks provider details. */
export function publicPayment(p: Payment) {
  return {
    reference: p.reference,
    amount: p.amount,
    currency: p.currency,
    status: p.status,
    method: p.method,
    customerEmail: p.customerEmail,
    description: p.description,
    metadata: p.metadata,
    createdAt: p.createdAt,
    paidAt: p.paidAt,
    checkoutUrl: `${process.env.APP_URL}/pay/${p.reference}`,
  };
}

function newReference() {
  return "spy_" + randomBytes(12).toString("hex");
}

export async function createPayment(merchantId: string, input: CreatePaymentInput) {
  const [p] = await db
    .insert(payments)
    .values({
      merchantId,
      reference: input.reference ?? newReference(),
      amount: input.amount,
      currency: input.currency ?? "NGN",
      customerEmail: input.customerEmail ?? null,
      description: input.description ?? null,
      callbackUrl: input.callbackUrl ?? null,
      metadata: input.metadata ?? {},
    })
    .returning();
  return p;
}

export async function getPayment(reference: string) {
  const [p] = await db.select().from(payments).where(eq(payments.reference, reference)).limit(1);
  return p ?? null;
}

/** Record the outcome of a provider charge/webhook against a payment. */
export async function settlePayment(
  reference: string,
  outcome: { status: "successful" | "failed"; provider: string; providerReference: string; method?: PaymentMethod },
) {
  const [p] = await db
    .update(payments)
    .set({
      status: outcome.status,
      provider: outcome.provider,
      providerReference: outcome.providerReference,
      ...(outcome.method ? { method: outcome.method } : {}),
      paidAt: outcome.status === "successful" ? new Date() : null,
    })
    .where(eq(payments.reference, reference))
    .returning();
  return p ?? null;
}

/** Store the chosen method + its display instructions (transfer/USSD). */
export async function attachInstructions(reference: string, method: PaymentMethod, instructions: Instructions) {
  const [p] = await db
    .update(payments)
    .set({ method, instructions })
    .where(eq(payments.reference, reference))
    .returning();
  return p ?? null;
}

export function paymentInstructions(p: Payment): Instructions | null {
  return (p.instructions as Instructions | null) ?? null;
}
