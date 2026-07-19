// Spurs Pay control plane — a dedicated `pay` schema in the shared Spurs Neon.
// Merchants ARE Spurs users (id = the accounts `sub`), so pay ↔ baas ↔ accounts
// all reference the same user via spurs.users.
import { pgSchema, text, uuid, integer, jsonb, timestamp, boolean, index, uniqueIndex } from "drizzle-orm/pg-core";

// Minimal declaration of the shared user table (owned by baas) for the FK only.
const spurs = pgSchema("spurs");
export const spursUsers = spurs.table("users", {
  id: text("id").primaryKey(),
});

export const pay = pgSchema("pay");

/** A merchant = a Spurs user who accepts payments. */
export const merchants = pay.table("merchants", {
  id: text("id").primaryKey().references(() => spursUsers.id, { onDelete: "cascade" }),
  businessName: text("business_name").notNull(),
  email: text("email"),
  webhookUrl: text("webhook_url"),
  webhookSecret: text("webhook_secret").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Merchant API keys — how a merchant's app authenticates to Spurs Pay. */
export const apiKeys = pay.table("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  merchantId: text("merchant_id").notNull().references(() => merchants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  prefix: text("prefix").notNull(),
  keyHash: text("key_hash").notNull(),
  revoked: boolean("revoked").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
});

/** A payment. `provider` / `providerReference` are internal — never exposed. */
export const payments = pay.table(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    merchantId: text("merchant_id").notNull().references(() => merchants.id, { onDelete: "cascade" }),
    reference: text("reference").notNull(),           // Spurs Pay reference (public)
    amount: integer("amount").notNull(),              // minor units (kobo/cents)
    currency: text("currency").notNull().default("NGN"),
    status: text("status").notNull().default("pending"), // pending | successful | failed
    customerEmail: text("customer_email"),
    description: text("description"),
    callbackUrl: text("callback_url"),
    method: text("method"),                            // card | bank_transfer | ussd (chosen at checkout)
    instructions: jsonb("instructions"),               // method-specific display info (bank details, ussd code)
    metadata: jsonb("metadata").notNull().default({}),
    provider: text("provider"),                       // internal — hidden from API
    providerReference: text("provider_reference"),    // internal — hidden from API
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("payments_reference_idx").on(t.reference), index("payments_merchant_idx").on(t.merchantId)],
);

export type Merchant = typeof merchants.$inferSelect;
export type Payment = typeof payments.$inferSelect;
