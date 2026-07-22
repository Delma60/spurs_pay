import { cookies } from "next/headers";

export type Mode = "test" | "live";

/** The dashboard's current view mode (test vs live). Defaults to test. */
export async function getMode(): Promise<Mode> {
  const c = await cookies();
  return c.get("pay_mode")?.value === "live" ? "live" : "test";
}
