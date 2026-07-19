import { db, merchants, apiKeys } from "@/lib/db";
import { and, eq } from "drizzle-orm";
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
