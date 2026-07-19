import { requireMerchant } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import AccountMenu from "@/components/AccountMenu";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireMerchant();

  return (
    <div className="min-h-screen flex-1 bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <Sidebar />
      <div className="flex min-h-screen flex-col md:pl-60">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-neutral-200 bg-white/90 px-5 backdrop-blur sm:px-8 dark:border-neutral-800 dark:bg-neutral-950/90">
          <span className="flex items-center gap-2 font-semibold md:hidden">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-indigo-600 text-xs font-bold text-white">S</span>
            Spurs Pay
          </span>
          <div className="ml-auto flex items-center gap-3">
            <AccountMenu name={user.name} email={user.email} />
          </div>
        </header>
        <main className="flex-1 p-5 sm:p-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
