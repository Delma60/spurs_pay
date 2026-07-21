import { createSpursProxy } from "@spurs-cloud/accounts/next";

// Only the merchant dashboard needs a session. The landing, hosted checkout and
// every API tier (v1 / private / charge / checkout / webhooks) stay public.
// (Next 16 renamed the `middleware` convention to `proxy`.)
export const proxy = createSpursProxy();

export const config = {
  matcher: ["/dashboard/:path*"],
};
