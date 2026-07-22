import { NextRequest, NextResponse } from "next/server";
import { resolveMerchant, resolveKey, type KeyMode } from "@/lib/merchants";

// Merchant apps authenticate with their Spurs Pay secret key:
//   Authorization: Bearer spk_...   (or  x-api-key: spk_...)
function rawKey(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return req.headers.get("x-api-key");
}

/** Resolve the calling merchant, or null. */
export async function authMerchant(req: NextRequest): Promise<string | null> {
  const key = rawKey(req);
  return key ? resolveMerchant(key) : null;
}

/** Resolve the calling merchant AND the key's mode (test/live), or null. */
export async function authKey(req: NextRequest): Promise<{ merchantId: string; mode: KeyMode } | null> {
  const key = rawKey(req);
  return key ? resolveKey(key) : null;
}

export const unauthorized = () =>
  NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
