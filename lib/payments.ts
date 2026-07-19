import { db, payments, type Payment } from "@/lib/db";
import { and, desc, eq } from "drizzle-orm";
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
    refundedAmount: p.refundedAmount,
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

/** A merchant's payments, newest first, optionally filtered by status. */
export async function listPayments(merchantId: string, opts: { status?: string; limit?: number } = {}) {
  const conds = [eq(payments.merchantId, merchantId)];
  if (opts.status) conds.push(eq(payments.status, opts.status));
  return db
    .select()
    .from(payments)
    .where(and(...conds))
    .orderBy(desc(payments.createdAt))
    .limit(opts.limit ?? 100);
}

export interface MerchantStats {
  collected: number;   // sum of successful amounts (minor units)
  refunded: number;    // sum of refunded amounts
  net: number;
  successful: number;  // count
  failed: number;
  total: number;
  successRate: number; // 0..100
  series: { t: number; v: number }[]; // successful volume by day (major units)
}

/** Derive dashboard stats + a volume series from a merchant's payments. */
export function computeStats(rows: Payment[]): MerchantStats {
  let collected = 0, refunded = 0, successful = 0, failed = 0;
  const byDay = new Map<string, number>();
  for (const p of rows) {
    if (p.status === "successful") {
      collected += p.amount;
      successful++;
      const day = new Date(p.paidAt ?? p.createdAt).toISOString().slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + p.amount);
    } else if (p.status === "failed") {
      failed++;
    }
    refunded += p.refundedAmount ?? 0;
  }
  const total = rows.length;
  const series = [...byDay.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, v]) => ({ t: new Date(day).getTime(), v: v / 100 }));
  return {
    collected, refunded, net: collected - refunded, successful, failed, total,
    successRate: total ? Math.round((successful / total) * 100) : 0,
    series,
  };
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
