import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySession, type Session } from "./session";

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

/** Require a signed-in merchant; redirect to login otherwise. */
export async function requireMerchant(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
