import pkg from "@next/env";
pkg.loadEnvConfig(process.cwd());
import postgres from "postgres";
const sql = postgres(process.env.DATABASE_SYNC_URL, { ssl: "require", max: 1, prepare: false });
try {
  await sql`ALTER TABLE "pay"."payments" ADD COLUMN IF NOT EXISTS "refunded_amount" integer DEFAULT 0 NOT NULL`;
  await sql`CREATE TABLE IF NOT EXISTS "pay"."refunds" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "merchant_id" text NOT NULL,
    "payment_reference" text NOT NULL,
    "amount" integer NOT NULL,
    "reason" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL)`;
  await sql`DO $$ BEGIN
    ALTER TABLE "pay"."refunds" ADD CONSTRAINT "refunds_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "pay"."merchants"("id") ON DELETE cascade;
  EXCEPTION WHEN duplicate_object THEN null; END $$`;
  await sql`CREATE INDEX IF NOT EXISTS "refunds_payment_idx" ON "pay"."refunds" ("payment_reference")`;
  console.log("refunds schema ready");
} finally { await sql.end(); }
