"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  CreditCard, 
  Users, 
  FileText, 
  Wallet, 
  Key,
  Webhook,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  Activity,
  ArrowUpRight,
} from "lucide-react";

// Navigation routing based on existing dashboard structure[cite: 1]
const NAV_GROUPS = [
  {
    title: "Business operations",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
      { name: "Customers", href: "/dashboard/customers", icon: Users },
      { name: "Invoices", href: "/dashboard/invoices", icon: FileText },
      { name: "Virtual Accounts", href: "/dashboard/virtual-accounts", icon: Wallet },
      { name: "Payouts", href: "/dashboard/payouts", icon: ArrowUpRight },
    ],
  },
  {
    title: "Developer tools",
    items: [
      { name: "API Keys", href: "/dashboard/keys", icon: Key },
      { name: "Webhooks", href: "/dashboard/webhooks", icon: Webhook },
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSandbox, setIsSandbox] = useState(false); // Can be hooked into global state later

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const SidebarContent = () => (
    <div className="flex h-full flex-col justify-between p-4">
      <div>
        {/* Header / Logo */}
        <div className={`flex items-center mb-8 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-2 text-white">
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            {!isCollapsed && <span className="font-semibold text-lg tracking-tight">Spurs Pay</span>}
          </div>
          
          {/* Desktop Collapse Toggle */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:block text-slate-400 hover:text-white transition-colors"
          >
            {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              {!isCollapsed && (
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {group.title}
                </h3>
              )}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  // Precise active state checking
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;

                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        title={isCollapsed ? item.name : undefined}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                          isActive
                            ? "bg-blue-600/10 text-blue-500"
                            : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        } ${isCollapsed ? "justify-center" : "justify-start"}`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? "text-blue-500" : ""}`} />
                        {!isCollapsed && <span>{item.name}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer / System Tools */}
      <div className="space-y-4">
        {/* Sandbox Toggle */}
        <button 
          onClick={() => setIsSandbox(!isSandbox)}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
            isSandbox ? "bg-amber-500/10 text-amber-500" : "bg-slate-800 text-slate-400"
          } ${isCollapsed ? "justify-center" : "justify-start"}`}
        >
          <div className={`w-2 h-2 rounded-full ${isSandbox ? "bg-amber-500" : "bg-emerald-500"}`} />
          {!isCollapsed && <span>{isSandbox ? "Test Mode" : "Live Mode"}</span>}
        </button>

        <hr className="border-slate-800" />

        {/* Logout[cite: 1] */}
        <Link
          href="/auth/logout" 
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all ${
            isCollapsed ? "justify-center" : "justify-start"
          }`}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span>Sign out</span>}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-0 left-0 z-50 w-full bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Activity className="w-6 h-6 text-blue-500" />
          <span className="font-semibold">Spurs Pay</span>
        </div>
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="text-slate-400 hover:text-white"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Off-Canvas Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden" 
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 transform border-r border-slate-800 bg-slate-950 transition-all duration-300 ease-in-out md:translate-x-0 md:static md:h-screen ${
          isCollapsed ? "md:w-20" : "md:w-64"
        } ${isMobileOpen ? "translate-x-0 w-64 pt-16" : "-translate-x-full w-64 pt-16 md:pt-0"}`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}