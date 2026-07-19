import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/session";

// Only the merchant dashboard needs a session. The landing, hosted checkout,
// and every API tier (v1 / private / charge / checkout / webhooks) stay public.
// (Next 16 renamed the `middleware` convention to `proxy`.)
export async function proxy(request: NextRequest) {
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
