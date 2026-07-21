import pkg from "@next/env";
pkg.loadEnvConfig(process.cwd());
import postgres from "postgres";
const sql = postgres(process.env.DATABASE_SYNC_URL, { ssl: "require", max: 1, prepare: false });
try {
  await sql`ALTER TABLE "pay"."api_keys" ADD COLUMN IF NOT EXISTS "mode" text DEFAULT 'test' NOT NULL`;
  await sql`ALTER TABLE "pay"."payments" ADD COLUMN IF NOT EXISTS "mode" text DEFAULT 'test' NOT NULL`;
  await sql`ALTER TABLE "pay"."payouts" ADD COLUMN IF NOT EXISTS "mode" text DEFAULT 'test' NOT NULL`;

  await sql`CREATE TABLE IF NOT EXISTS "pay"."idempotency_keys" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "merchant_id" text NOT NULL, "key" text NOT NULL, "reference" text NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL)`;
  await sql`DO $$ BEGIN
    ALTER TABLE "pay"."idempotency_keys" ADD CONSTRAINT "idempotency_merchant_fk" FOREIGN KEY ("merchant_id") REFERENCES "pay"."merchants"("id") ON DELETE cascade;
  EXCEPTION WHEN duplicate_object THEN null; END $$`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS "idempotency_merchant_key_idx" ON "pay"."idempotency_keys" ("merchant_id","key")`;

  await sql`CREATE TABLE IF NOT EXISTS "pay"."card_tokens" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "token" text NOT NULL, "merchant_id" text, "mode" text DEFAULT 'test' NOT NULL,
    "brand" text NOT NULL, "last4" text NOT NULL, "exp_month" text NOT NULL, "exp_year" text NOT NULL,
    "provider_token" text, "used" boolean DEFAULT false NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL, "expires_at" timestamptz)`;
  await sql`DO $$ BEGIN
    ALTER TABLE "pay"."card_tokens" ADD CONSTRAINT "card_tokens_merchant_fk" FOREIGN KEY ("merchant_id") REFERENCES "pay"."merchants"("id") ON DELETE cascade;
  EXCEPTION WHEN duplicate_object THEN null; END $$`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS "card_tokens_token_idx" ON "pay"."card_tokens" ("token")`;

  console.log("hardening schema ready");
} finally { await sql.end(); }
