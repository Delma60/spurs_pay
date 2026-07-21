import Link from "next/link";
import { FlaskConical, KeyRound, Settings, Zap } from "lucide-react";
import AccountMenu from "@/components/AccountMenu";

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
  testMode,
}: {
  name?: string;
  email?: string;
  businessName?: string | null;
  testMode: boolean;
}) {
  return (
    <header className="sticky top-0 z-30 hidden h-16 items-center gap-4 border-b border-slate-800 bg-slate-900/80 px-6 backdrop-blur md:flex">
      <div className="flex min-w-0 items-center gap-3">
        <span className="truncate font-medium text-slate-100">{businessName ?? "Your business"}</span>
        {testMode ? (
          <span className="flex shrink-0 items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400">
            <FlaskConical size={11} /> Test mode
          </span>
        ) : (
          <span className="flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
            <Zap size={11} /> Live
          </span>
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
