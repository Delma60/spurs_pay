import pkg from "@next/env";
pkg.loadEnvConfig(process.cwd());
import postgres from "postgres";
const sql = postgres(process.env.DATABASE_SYNC_URL, { ssl: "require", max: 1, prepare: false });
try {
  await sql`ALTER TABLE "pay"."payments" ADD COLUMN IF NOT EXISTS "method" text`;
  await sql`ALTER TABLE "pay"."payments" ADD COLUMN IF NOT EXISTS "instructions" jsonb`;
  console.log("payment method columns ready");
} finally { await sql.end(); }
