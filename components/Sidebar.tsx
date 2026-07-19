"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, CreditCard, FileText, Users, Landmark, WalletCards, KeyRound, Settings,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/invoices", label: "Invoices", icon: FileText },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/virtual-accounts", label: "Virtual accounts", icon: Landmark },
  { href: "/dashboard/cards", label: "Cards", icon: WalletCards },
  { href: "/dashboard/keys", label: "API keys", icon: KeyRound },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-neutral-200 bg-white md:flex dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex h-16 items-center gap-2 px-5 font-semibold">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-600 text-sm font-bold text-white">S</span>
        Spurs Pay
      </div>
      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {NAV.map((item) => {
          const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                active
                  ? "bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100"
              }`}
            >
              <Icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-neutral-200 px-5 py-4 text-xs text-neutral-400 dark:border-neutral-800">
        Part of Spurs Cloud
      </div>
    </aside>
  );
}
