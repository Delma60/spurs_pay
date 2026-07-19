import { db, payments, refunds } from "@/lib/db";
import { and, desc, eq } from "drizzle-orm";
import { getMerchant } from "@/lib/merchants";
import { notifyMerchant } from "@/lib/webhooks";

/**
 * Refund a payment (full or partial). Records the refund, bumps the payment's
 * refunded total, and moves its status to refunded / partially_refunded.
 * In sandbox there's no real processor call — the money model is what matters.
 */
export async function refundPayment(merchantId: string, reference: string, amount?: number, reason?: string) {
  const [p] = await db.select().from(payments).where(eq(payments.reference, reference)).limit(1);
  if (!p) throw new Error("Payment not found");
  if (p.merchantId !== merchantId) throw new Error("Not your payment");
  if (p.status !== "successful" && p.status !== "partially_refunded") {
    throw new Error("Only successful payments can be refunded");
  }

  const remaining = p.amount - p.refundedAmount;
  const refundAmt = amount ?? remaining;
  if (refundAmt <= 0 || refundAmt > remaining) throw new Error("Invalid refund amount");

  const newRefunded = p.refundedAmount + refundAmt;
  const status = newRefunded >= p.amount ? "refunded" : "partially_refunded";

  const settled = await db.transaction(async (tx) => {
    await tx.insert(refunds).values({ merchantId, paymentReference: reference, amount: refundAmt, reason: reason ?? null });
    const [updated] = await tx
      .update(payments)
      .set({ refundedAmount: newRefunded, status })
      .where(eq(payments.reference, reference))
      .returning();
    return updated;
  });

  // Tell the merchant's backend (fire-and-forget), same signed-webhook path.
  const merchant = await getMerchant(merchantId);
  if (merchant && settled) void notifyMerchant(merchant, settled);

  return settled;
}

export async function listRefunds(merchantId: string, limit = 100) {
  return db.select().from(refunds).where(eq(refunds.merchantId, merchantId)).orderBy(desc(refunds.createdAt)).limit(limit);
}

export async function refundsForPayment(reference: string) {
  return db.select().from(refunds).where(eq(refunds.paymentReference, reference)).orderBy(desc(refunds.createdAt));
}
