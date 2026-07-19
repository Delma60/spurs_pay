import pkg from "@next/env";
pkg.loadEnvConfig(process.cwd());
import postgres from "postgres";
const sql = postgres(process.env.DATABASE_SYNC_URL, { ssl: "require", max: 1, prepare: false });
const fkMerchant = async (t, name) => sql`DO $$ BEGIN
  ALTER TABLE ${sql(`pay.${t}`)} ADD CONSTRAINT ${sql(name)} FOREIGN KEY ("merchant_id") REFERENCES "pay"."merchants"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN null; END $$`;
try {
  await sql`CREATE TABLE IF NOT EXISTS "pay"."invoices" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "merchant_id" text NOT NULL, "number" text NOT NULL, "customer_email" text NOT NULL,
    "amount" integer NOT NULL, "currency" text DEFAULT 'NGN' NOT NULL, "description" text,
    "status" text DEFAULT 'open' NOT NULL, "pay_reference" text,
    "due_date" timestamptz, "created_at" timestamptz DEFAULT now() NOT NULL, "paid_at" timestamptz)`;
  await sql`CREATE TABLE IF NOT EXISTS "pay"."virtual_accounts" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "merchant_id" text NOT NULL, "label" text NOT NULL, "bank_name" text NOT NULL,
    "account_number" text NOT NULL, "account_name" text NOT NULL, "currency" text DEFAULT 'NGN' NOT NULL,
    "active" boolean DEFAULT true NOT NULL, "created_at" timestamptz DEFAULT now() NOT NULL)`;
  await sql`CREATE TABLE IF NOT EXISTS "pay"."issued_cards" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "merchant_id" text NOT NULL, "label" text NOT NULL, "brand" text DEFAULT 'Spurs' NOT NULL,
    "last4" text NOT NULL, "exp_month" text NOT NULL, "exp_year" text NOT NULL,
    "balance" integer DEFAULT 0 NOT NULL, "currency" text DEFAULT 'NGN' NOT NULL,
    "frozen" boolean DEFAULT false NOT NULL, "created_at" timestamptz DEFAULT now() NOT NULL)`;
  await fkMerchant("invoices", "invoices_merchant_id_merchants_id_fk");
  await fkMerchant("virtual_accounts", "vaccounts_merchant_id_merchants_id_fk");
  await fkMerchant("issued_cards", "cards_merchant_id_merchants_id_fk");
  await sql`CREATE INDEX IF NOT EXISTS "invoices_merchant_idx" ON "pay"."invoices" ("merchant_id")`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS "invoices_number_idx" ON "pay"."invoices" ("merchant_id","number")`;
  await sql`CREATE INDEX IF NOT EXISTS "vaccounts_merchant_idx" ON "pay"."virtual_accounts" ("merchant_id")`;
  await sql`CREATE INDEX IF NOT EXISTS "cards_merchant_idx" ON "pay"."issued_cards" ("merchant_id")`;
  console.log("gateway schema ready");
} finally { await sql.end(); }
