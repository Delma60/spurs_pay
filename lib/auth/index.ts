import { redirect } from "next/navigation";
import { getSpursUser, spurs } from "@spurs-cloud/accounts/next";
import type { SpursUser } from "@spurs-cloud/accounts";
import { db, spursUsers } from "@/lib/db";
import { ensureMerchant } from "@/lib/merchants";

/**
 * Auth is the shared Spurs session — one cookie issued by accounts covers every
 * Spurs app. All the OIDC/PKCE plumbing lives in `@spurs-cloud/accounts`.
 */
export type Session = SpursUser;

export async function getSession(): Promise<Session | null> {
  return getSpursUser();
}

/**
 * Require a signed-in merchant. A merchant *is* a Spurs user, so we make sure
 * both the shared user row (FK target) and their merchant record exist — this
 * used to happen in the OAuth callback, which the shared session removes.
 */
export async function requireMerchant(): Promise<Session> {
  const user = await getSession();
  if (!user) redirect(spurs().loginUrl(`${process.env.APP_URL}/dashboard`));

  await db
    .insert(spursUsers)
    .values({ id: user.sub, name: user.name ?? null, email: user.email ?? null })
    .onConflictDoNothing();
  await ensureMerchant(user.sub, user.name ?? user.email ?? "My business", user.email);

  return user;
}
