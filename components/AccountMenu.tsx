"use client";

import { SpursAccountMenu } from "@spurs-cloud/accounts/react";

/**
 * The shared Spurs account avatar, branded for Pay (indigo). The component lives
 * in `@spurs-cloud/accounts` so every Spurs app shows the same menu.
 */
export default function AccountMenu({ name, email }: { name?: string; email?: string }) {
  return (
    <SpursAccountMenu
      user={{ name, email }}
      accent="#6366f1"
      accentTo="#7c3aed"
      theme="dark"
      signOutUrl="/auth/logout"
    />
  );
}
