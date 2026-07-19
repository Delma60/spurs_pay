// Seed a test merchant (Spurs user "2") + an API key, print the raw key once.
import pkg from "@next/env";
const { loadEnvConfig } = pkg;
loadEnvConfig(process.cwd());

import postgres from "postgres";
import { createHash, randomBytes } from "node:crypto";

const sql = postgres(process.env.DATABASE_SYNC_URL, { ssl: "require", max: 1, prepare: false });
const hash = (s) => createHash("sha256").update(s).digest("hex");

const USER_ID = "2";
try {
  // Ensure the shared Spurs user exists (baas owns spurs.users).
  await sql`insert into spurs.users (id) values (${USER_ID}) on conflict (id) do nothing`;

  await sql`
    insert into pay.merchants (id, business_name, email, webhook_secret)
    values (${USER_ID}, 'Acme Test Store', 'merchant@example.com', ${"whsec_" + randomBytes(16).toString("hex")})
    on conflict (id) do update set business_name = excluded.business_name`;

  const raw = "spk_" + randomBytes(24).toString("base64url");
  await sql`
    insert into pay.api_keys (merchant_id, name, prefix, key_hash)
    values (${USER_ID}, 'seed key', ${raw.slice(0, 12)}, ${hash(raw)})`;

  console.log("Merchant:", USER_ID);
  console.log("API KEY :", raw);
} finally {
  await sql.end();
}
