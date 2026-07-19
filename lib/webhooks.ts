import { createHmac } from "node:crypto";
import type { Merchant, Payment } from "@/lib/db";
import { publicPayment } from "@/lib/payments";

/**
 * Emit a Spurs-signed webhook to the merchant. This is the "laundering" step:
 * whatever the underlying processor sent us, the merchant only ever receives a
 * Spurs-branded, Spurs-signed event. They verify it with their webhook secret.
 */
export async function notifyMerchant(merchant: Merchant, payment: Payment) {
  if (!merchant.webhookUrl) return;

  const EVENTS: Record<string, string> = {
    successful: "payment.successful",
    failed: "payment.failed",
    refunded: "payment.refunded",
    partially_refunded: "payment.refunded",
  };
  const event = {
    event: EVENTS[payment.status] ?? "payment.updated",
    data: publicPayment(payment),
  };
  const body = JSON.stringify(event);
  const signature = createHmac("sha256", merchant.webhookSecret).update(body).digest("hex");

  try {
    await fetch(merchant.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-spurs-signature": signature },
      body,
    });
  } catch {
    // Best-effort; a real system would queue + retry with backoff.
  }
}
