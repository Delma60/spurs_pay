import Link from "next/link";
import { KeyRound, Settings } from "lucide-react";
import AccountMenu from "@/components/AccountMenu";
import ModeSwitcher from "@/components/ModeSwitcher";
import type { Mode } from "@/lib/mode";

/**
 * Desktop top bar for the merchant dashboard. The Sidebar renders its own bar on
 * mobile (hence `md:flex` here), so the two never stack.
 *
 * The mode pill matters most: a merchant should never be unsure whether the
 * money is real.
 */
export default function TopBar({
  name,
  email,
  businessName,
  mode,
  sandbox,
}: {
  name?: string;
  email?: string;
  businessName?: string | null;
  mode: Mode;
  sandbox: boolean;
}) {
  return (
    <header className="sticky top-0 z-30 hidden h-16 items-center gap-4 border-b border-slate-800 bg-slate-900/80 px-6 backdrop-blur md:flex">
      <div className="flex min-w-0 items-center gap-3">
        <span className="truncate font-medium text-slate-100">{businessName ?? "Your business"}</span>
        <ModeSwitcher mode={mode} />
        {sandbox && (
          <span className="shrink-0 text-[11px] text-slate-500">sandbox · no real money</span>
        )}
      </div>

      <nav className="ml-auto flex items-center gap-1">
        <Link
          href="/dashboard/keys"
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
        >
          <KeyRound size={15} /> API keys
        </Link>
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
        >
          <Settings size={15} /> Settings
        </Link>
        <div className="ml-2">
          <AccountMenu name={name} email={email} />
        </div>
      </nav>
    </header>
  );
}
