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

/** Issue a merchant API key — secret returned once, only its hash stored. */
export async function createMerchantKey(merchantId: string, name: string) {
  const raw = "spk_" + randomBytes(24).toString("base64url");
  const [row] = await db
    .insert(apiKeys)
    .values({ merchantId, name, prefix: raw.slice(0, 12), keyHash: hashKey(raw) })
    .returning();
  return { key: raw, id: row.id };
}

/** List a merchant's API keys (no secrets — only prefixes). */
export async function listKeys(merchantId: string) {
  return db
    .select({
      id: apiKeys.id, name: apiKeys.name, prefix: apiKeys.prefix,
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

/** Update merchant profile / webhook URL. */
export async function updateMerchant(merchantId: string, patch: { businessName?: string; email?: string | null; webhookUrl?: string | null }) {
  const set: Record<string, unknown> = {};
  if (patch.businessName !== undefined) set.businessName = patch.businessName;
  if (patch.email !== undefined) set.email = patch.email;
  if (patch.webhookUrl !== undefined) set.webhookUrl = patch.webhookUrl;
  if (Object.keys(set).length === 0) return;
  await db.update(merchants).set(set).where(eq(merchants.id, merchantId));
}

/** Roll the merchant's webhook signing secret; returns the new value. */
export async function regenerateWebhookSecret(merchantId: string): Promise<string> {
  const secret = "whsec_" + randomBytes(16).toString("hex");
  await db.update(merchants).set({ webhookSecret: secret }).where(eq(merchants.id, merchantId));
  return secret;
}

/** Resolve a raw merchant key to its merchant id (or null). */
export async function resolveMerchant(raw: string): Promise<string | null> {
  const [row] = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.keyHash, hashKey(raw)), eq(apiKeys.revoked, false)))
    .limit(1);
  if (!row) return null;
  void db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, row.id));
  return row.merchantId;
}
