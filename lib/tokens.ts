import { db, cardTokens, type CardToken } from "@/lib/db";
import { eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import type { Card } from "@/lib/providers/types";

/** Best-effort card brand from the leading digits. */
export function brandOf(number: string): string {
  const n = number.replace(/\s+/g, "");
  if (/^4/.test(n)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(n)) return "Mastercard";
  if (/^3[47]/.test(n)) return "American Express";
  if (/^(506|507|6500|65)/.test(n)) return "Verve";
  return "Card";
}

export interface TokenView {
  token: string;
  brand: string;
  last4: string;
  expMonth: string;
  expYear: string;
}

/**
 * Turn a card into a token. **The PAN is never stored** — only the last 4 and
 * expiry, plus an opaque provider handle. Charge with the token afterwards and
 * no system downstream ever sees the full number.
 */
export async function createCardToken(
  card: Card,
  opts: { merchantId?: string | null; mode?: "test" | "live"; singleUse?: boolean } = {},
): Promise<TokenView> {
  const number = card.number.replace(/\s+/g, "");
  const last4 = number.slice(-4);

  // In sandbox the "provider token" just encodes the deterministic decline rule
  // (a PAN ending 0000 declines) so a later token charge behaves the same as a
  // raw-card charge — without keeping the PAN around. A real processor returns
  // its own token here.
  const providerToken = last4.endsWith("0000") ? "sbx_decline" : "sbx_ok";

  const token = "tok_" + randomBytes(16).toString("base64url");
  const expiresAt = new Date(Date.now() + 15 * 60_000); // single-use tokens expire fast

  await db.insert(cardTokens).values({
    token,
    merchantId: opts.merchantId ?? null,
    mode: opts.mode ?? "test",
    brand: brandOf(number),
    last4,
    expMonth: card.expMonth,
    expYear: card.expYear,
    providerToken,
    used: false,
    expiresAt: opts.singleUse === false ? null : expiresAt,
  });

  return { token, brand: brandOf(number), last4, expMonth: card.expMonth, expYear: card.expYear };
}

export async function getCardToken(token: string): Promise<CardToken | null> {
  const [t] = await db.select().from(cardTokens).where(eq(cardTokens.token, token)).limit(1);
  return t ?? null;
}

export async function markTokenUsed(token: string): Promise<void> {
  await db.update(cardTokens).set({ used: true }).where(eq(cardTokens.token, token));
}
