import { createHmac, randomBytes } from "node:crypto";
import { and, desc, eq, lte, sql } from "drizzle-orm";
import { db, merchants, webhookDeliveries, type Merchant, type Payment, type WebhookDelivery } from "@/lib/db";
import { publicPayment } from "@/lib/payments";

/** Retry backoff (minutes) per attempt. 6 attempts total ≈ over ~8.5 hours. */
const BACKOFF_MIN = [1, 5, 30, 120, 360];
const MAX_ATTEMPTS = 6;
const TIMEOUT_MS = 10_000;

const EVENTS: Record<string, string> = {
  successful: "payment.successful",
  failed: "payment.failed",
  refunded: "payment.refunded",
  partially_refunded: "payment.refunded",
};

/**
 * Emit a Spurs-signed webhook to the merchant. This is the "laundering" step:
 * whatever the underlying processor sent us, the merchant only ever receives a
 * Spurs-branded, Spurs-signed event.
 *
 * Every emission is logged as a delivery with a stable event ID, attempted
 * immediately, and — if it fails — scheduled for retry with exponential backoff.
 */
export async function notifyMerchant(merchant: Merchant, payment: Payment) {
  if (!merchant.webhookUrl) return;

  const eventId = "evt_" + randomBytes(16).toString("hex");
  const body = JSON.stringify({
    id: eventId,
    event: EVENTS[payment.status] ?? "payment.updated",
    created: new Date().toISOString(),
    data: publicPayment(payment),
  });
  const signature = createHmac("sha256", merchant.webhookSecret).update(body).digest("hex");

  const [delivery] = await db
    .insert(webhookDeliveries)
    .values({
      merchantId: merchant.id,
      eventId,
      event: EVENTS[payment.status] ?? "payment.updated",
      paymentReference: payment.reference,
      url: merchant.webhookUrl,
      payload: body,
      signature,
      status: "pending",
      maxAttempts: MAX_ATTEMPTS,
    })
    .returning();

  await attemptDelivery(delivery);
}

/** POST a single delivery and record the outcome (success, or a scheduled retry). */
export async function attemptDelivery(d: WebhookDelivery): Promise<WebhookDelivery> {
  const attempts = d.attempts + 1;
  let statusCode: number | null = null;
  let error: string | null = null;

  try {
    const res = await fetch(d.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-spurs-signature": d.signature,
        "x-spurs-event": d.event,
        "x-spurs-event-id": d.eventId,
      },
      body: d.payload,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    statusCode = res.status;
    if (!res.ok) error = `HTTP ${res.status}`;
  } catch (e) {
    error = e instanceof Error ? (e.name === "TimeoutError" ? "Request timed out" : e.message) : "Delivery failed";
  }

  const delivered = error === null;
  const exhausted = attempts >= d.maxAttempts;
  const nextAttemptAt =
    delivered || exhausted ? null : new Date(Date.now() + BACKOFF_MIN[Math.min(attempts - 1, BACKOFF_MIN.length - 1)] * 60_000);

  const [updated] = await db
    .update(webhookDeliveries)
    .set({
      attempts,
      status: delivered ? "delivered" : "failed",
      lastStatusCode: statusCode,
      lastError: error,
      nextAttemptAt,
      deliveredAt: delivered ? new Date() : null,
    })
    .where(eq(webhookDeliveries.id, d.id))
    .returning();

  return updated;
}

/** A merchant's delivery log, newest first. */
export function listDeliveries(merchantId: string, limit = 100) {
  return db
    .select()
    .from(webhookDeliveries)
    .where(eq(webhookDeliveries.merchantId, merchantId))
    .orderBy(desc(webhookDeliveries.createdAt))
    .limit(limit);
}

/** Manually redeliver a specific event now (resets the schedule, sends again). */
export async function redeliver(id: string, merchantId: string): Promise<WebhookDelivery | null> {
  const [d] = await db
    .select()
    .from(webhookDeliveries)
    .where(and(eq(webhookDeliveries.id, id), eq(webhookDeliveries.merchantId, merchantId)));
  if (!d) return null;
  return attemptDelivery(d);
}

/**
 * Retry every delivery whose backoff is due. Meant to be poked by a scheduler
 * (or the internal /api/private/webhooks/process endpoint); safe to call often.
 */
export async function processDueDeliveries(limit = 50): Promise<number> {
  const due = await db
    .select()
    .from(webhookDeliveries)
    .where(
      and(
        eq(webhookDeliveries.status, "failed"),
        lte(webhookDeliveries.attempts, MAX_ATTEMPTS - 1),
        lte(webhookDeliveries.nextAttemptAt, sql`now()`),
      ),
    )
    .limit(limit);

  for (const d of due) await attemptDelivery(d);
  return due.length;
}
