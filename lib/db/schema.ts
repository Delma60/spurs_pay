// Spurs Pay control plane — a dedicated `pay` schema in the shared Spurs Neon.
// Merchants ARE Spurs users (id = the accounts `sub`), so pay ↔ baas ↔ accounts
// all reference the same user via spurs.users.
import { pgSchema, text, uuid, integer, jsonb, timestamp, boolean, index, uniqueIndex } from "drizzle-orm/pg-core";

// Declaration of the shared user table (owned by baas). Pay upserts id/name/email
// on merchant SSO login so its FKs resolve; other columns are managed elsewhere.
const spurs = pgSchema("spurs");
export const spursUsers = spurs.table("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email"),
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
    status: text("status").notNull().default("pending"), // pending | successful | failed | refunded | partially_refunded
    customerEmail: text("customer_email"),
    description: text("description"),
    callbackUrl: text("callback_url"),
    method: text("method"),                            // card | bank_transfer | ussd (chosen at checkout)
    instructions: jsonb("instructions"),               // method-specific display info (bank details, ussd code)
    refundedAmount: integer("refunded_amount").notNull().default(0), // minor units refunded so far
    metadata: jsonb("metadata").notNull().default({}),
    provider: text("provider"),                       // internal — hidden from API
    providerReference: text("provider_reference"),    // internal — hidden from API
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("payments_reference_idx").on(t.reference), index("payments_merchant_idx").on(t.merchantId)],
);

/** A refund against a payment (records; in sandbox there's no real processor call). */
export const refunds = pay.table(
  "refunds",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    merchantId: text("merchant_id").notNull().references(() => merchants.id, { onDelete: "cascade" }),
    paymentReference: text("payment_reference").notNull(),
    amount: integer("amount").notNull(), // minor units
    reason: text("reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("refunds_payment_idx").on(t.paymentReference)],
);

/** A merchant invoice. Paid through a hosted Spurs Pay checkout. */
export const invoices = pay.table(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    merchantId: text("merchant_id").notNull().references(() => merchants.id, { onDelete: "cascade" }),
    number: text("number").notNull(),                 // INV-0001
    customerEmail: text("customer_email").notNull(),
    amount: integer("amount").notNull(),
    currency: text("currency").notNull().default("NGN"),
    description: text("description"),
    status: text("status").notNull().default("open"), // open | paid | void
    payReference: text("pay_reference"),              // linked payment reference
    dueDate: timestamp("due_date", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
  },
  (t) => [index("invoices_merchant_idx").on(t.merchantId), uniqueIndex("invoices_number_idx").on(t.merchantId, t.number)],
);

/** A dedicated virtual account (NUBAN) that collects bank transfers for a merchant. */
export const virtualAccounts = pay.table(
  "virtual_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    merchantId: text("merchant_id").notNull().references(() => merchants.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    bankName: text("bank_name").notNull(),
    accountNumber: text("account_number").notNull(),
    accountName: text("account_name").notNull(),
    currency: text("currency").notNull().default("NGN"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("vaccounts_merchant_idx").on(t.merchantId)],
);

/** An issued virtual card a merchant can spend from. Full PAN is never stored. */
export const issuedCards = pay.table(
  "issued_cards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    merchantId: text("merchant_id").notNull().references(() => merchants.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    brand: text("brand").notNull().default("Spurs"),
    last4: text("last4").notNull(),
    expMonth: text("exp_month").notNull(),
    expYear: text("exp_year").notNull(),
    balance: integer("balance").notNull().default(0),
    currency: text("currency").notNull().default("NGN"),
    frozen: boolean("frozen").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("cards_merchant_idx").on(t.merchantId)],
);

/** A saved bank account a merchant can pay out to. */
export const recipients = pay.table(
  "recipients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    merchantId: text("merchant_id").notNull().references(() => merchants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),                      // merchant's own label
    bankName: text("bank_name").notNull(),
    bankCode: text("bank_code").notNull(),
    accountNumber: text("account_number").notNull(),
    accountName: text("account_name").notNull(),       // resolved from the bank
    currency: text("currency").notNull().default("NGN"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("recipients_merchant_idx").on(t.merchantId)],
);

/** Money leaving the platform: a payout to a recipient's bank account. */
export const payouts = pay.table(
  "payouts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    merchantId: text("merchant_id").notNull().references(() => merchants.id, { onDelete: "cascade" }),
    recipientId: uuid("recipient_id").notNull().references(() => recipients.id, { onDelete: "restrict" }),
    reference: text("reference").notNull(),            // spo_… (public)
    amount: integer("amount").notNull(),               // minor units
    currency: text("currency").notNull().default("NGN"),
    status: text("status").notNull().default("pending"), // pending | successful | failed
    narration: text("narration"),
    failureReason: text("failure_reason"),
    provider: text("provider"),                        // internal — hidden from API
    providerReference: text("provider_reference"),     // internal — hidden from API
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("payouts_reference_idx").on(t.reference), index("payouts_merchant_idx").on(t.merchantId)],
);

export type Recipient = typeof recipients.$inferSelect;
export type Payout = typeof payouts.$inferSelect;
export type Merchant = typeof merchants.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Refund = typeof refunds.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type VirtualAccount = typeof virtualAccounts.$inferSelect;
export type IssuedCard = typeof issuedCards.$inferSelect;
