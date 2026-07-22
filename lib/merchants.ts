import { db, merchants, apiKeys } from "@/lib/db";
import { and, desc, eq } from "drizzle-orm";
import { createHash, randomBytes } from "node:crypto";

function hashKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/** Upsert a merchant for a Spurs user (id = accounts `sub`). */
export async function ensureMerchant(spursUserId: string, businessName: string, email?: string) {
  const [m] = await db
    .insert(merchants)
    .values({
      id: spursUserId,
      businessName,
      email: email ?? null,
      webhookSecret: "whsec_" + randomBytes(16).toString("hex"),
    })
    .onConflictDoUpdate({ target: merchants.id, set: { businessName } })
    .returning();
  return m;
}

export async function getMerchant(id: string) {
  const [m] = await db.select().from(merchants).where(eq(merchants.id, id)).limit(1);
  return m ?? null;
}

export type KeyMode = "test" | "live";

/**
 * Issue a merchant API key — secret returned once, only its hash stored.
 * The mode is in the key itself (`sk_test_…` / `sk_live_…`): a test key only ever
 * touches the sandbox processor, a live key the real one.
 */
export async function createMerchantKey(merchantId: string, name: string, mode: KeyMode = "test") {
  const raw = `sk_${mode}_` + randomBytes(24).toString("base64url");
  const [row] = await db
    .insert(apiKeys)
    .values({ merchantId, name, mode, prefix: raw.slice(0, 16), keyHash: hashKey(raw) })
    .returning();
  return { key: raw, id: row.id, mode };
}

/** List a merchant's API keys (no secrets — only prefixes). */
export async function listKeys(merchantId: string) {
  return db
    .select({
      id: apiKeys.id, name: apiKeys.name, mode: apiKeys.mode, prefix: apiKeys.prefix,
      revoked: apiKeys.revoked, createdAt: apiKeys.createdAt, lastUsedAt: apiKeys.lastUsedAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.merchantId, merchantId))
    .orderBy(desc(apiKeys.createdAt));
}

/** Revoke one of a merchant's keys (scoped to that merchant). */
export async function revokeKey(merchantId: string, keyId: string) {
  await db.update(apiKeys).set({ revoked: true }).where(and(eq(apiKeys.id, keyId), eq(apiKeys.merchantId, merchantId)));
}

/** Update merchant profile / webhook URL / methods / reference affixes. */
export async function updateMerchant(merchantId: string, patch: {
  businessName?: string; email?: string | null; webhookUrl?: string | null;
  allowedMethods?: string;
  paymentPrefix?: string; paymentSuffix?: string;
  invoicePrefix?: string; invoiceSuffix?: string;
  transactionPrefix?: string; transactionSuffix?: string;
}) {
  const set: Record<string, unknown> = {};
  for (const k of [
    "businessName", "email", "webhookUrl", "allowedMethods",
    "paymentPrefix", "paymentSuffix", "invoicePrefix", "invoiceSuffix",
    "transactionPrefix", "transactionSuffix",
  ] as const) {
    if (patch[k] !== undefined) set[k] = patch[k];
  }
  if (Object.keys(set).length === 0) return;
  await db.update(merchants).set(set).where(eq(merchants.id, merchantId));
}

/** Roll the merchant's webhook signing secret; returns the new value. */
export async function regenerateWebhookSecret(merchantId: string): Promise<string> {
  const secret = "whsec_" + randomBytes(16).toString("hex");
  await db.update(merchants).set({ webhookSecret: secret }).where(eq(merchants.id, merchantId));
  return secret;
}

/** Resolve a raw key to its merchant + mode (or null). Legacy `spk_` keys = test. */
export async function resolveKey(raw: string): Promise<{ merchantId: string; mode: KeyMode } | null> {
  const [row] = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.keyHash, hashKey(raw)), eq(apiKeys.revoked, false)))
    .limit(1);
  if (!row) return null;
  void db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, row.id));
  return { merchantId: row.merchantId, mode: (row.mode as KeyMode) ?? "test" };
}

/** Resolve a raw merchant key to its merchant id (or null). */
export async function resolveMerchant(raw: string): Promise<string | null> {
  return (await resolveKey(raw))?.merchantId ?? null;
}
