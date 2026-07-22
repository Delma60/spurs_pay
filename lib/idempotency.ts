import { db, idempotencyKeys, payments, type Payment } from "@/lib/db";
import { and, eq } from "drizzle-orm";

/**
 * If this merchant already used this Idempotency-Key, return the payment it
 * produced — so a retried request never creates a second charge.
 */
export async function replayPayment(merchantId: string, key: string): Promise<Payment | null> {
  const [seen] = await db
    .select()
    .from(idempotencyKeys)
    .where(and(eq(idempotencyKeys.merchantId, merchantId), eq(idempotencyKeys.key, key)))
    .limit(1);
  if (!seen) return null;

  const [payment] = await db.select().from(payments).where(eq(payments.reference, seen.reference)).limit(1);
  return payment ?? null;
}

/** Record the key → payment mapping. Ignores races (unique index wins). */
export async function rememberKey(merchantId: string, key: string, reference: string): Promise<void> {
  await db
    .insert(idempotencyKeys)
    .values({ merchantId, key, reference })
    .onConflictDoNothing({ target: [idempotencyKeys.merchantId, idempotencyKeys.key] });
}
