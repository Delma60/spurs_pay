import pkg from "@next/env";
pkg.loadEnvConfig(process.cwd());
import postgres from "postgres";
const sql = postgres(process.env.DATABASE_SYNC_URL, { ssl: "require", max: 1, prepare: false });
try {
  await sql`CREATE TABLE IF NOT EXISTS "pay"."recipients" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "merchant_id" text NOT NULL, "name" text NOT NULL,
    "bank_name" text NOT NULL, "bank_code" text NOT NULL,
    "account_number" text NOT NULL, "account_name" text NOT NULL,
    "currency" text DEFAULT 'NGN' NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL)`;
  await sql`CREATE TABLE IF NOT EXISTS "pay"."payouts" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "merchant_id" text NOT NULL, "recipient_id" uuid NOT NULL,
    "reference" text NOT NULL, "amount" integer NOT NULL,
    "currency" text DEFAULT 'NGN' NOT NULL, "status" text DEFAULT 'pending' NOT NULL,
    "narration" text, "failure_reason" text,
    "provider" text, "provider_reference" text,
    "created_at" timestamptz DEFAULT now() NOT NULL, "completed_at" timestamptz)`;
  await sql`DO $$ BEGIN
    ALTER TABLE "pay"."recipients" ADD CONSTRAINT "recipients_merchant_fk" FOREIGN KEY ("merchant_id") REFERENCES "pay"."merchants"("id") ON DELETE cascade;
  EXCEPTION WHEN duplicate_object THEN null; END $$`;
  await sql`DO $$ BEGIN
    ALTER TABLE "pay"."payouts" ADD CONSTRAINT "payouts_merchant_fk" FOREIGN KEY ("merchant_id") REFERENCES "pay"."merchants"("id") ON DELETE cascade;
  EXCEPTION WHEN duplicate_object THEN null; END $$`;
  await sql`DO $$ BEGIN
    ALTER TABLE "pay"."payouts" ADD CONSTRAINT "payouts_recipient_fk" FOREIGN KEY ("recipient_id") REFERENCES "pay"."recipients"("id") ON DELETE restrict;
  EXCEPTION WHEN duplicate_object THEN null; END $$`;
  await sql`CREATE INDEX IF NOT EXISTS "recipients_merchant_idx" ON "pay"."recipients" ("merchant_id")`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS "payouts_reference_idx" ON "pay"."payouts" ("reference")`;
  await sql`CREATE INDEX IF NOT EXISTS "payouts_merchant_idx" ON "pay"."payouts" ("merchant_id")`;
  console.log("payout schema ready");
} finally { await sql.end(); }
