import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { requireMerchant } from "@/lib/auth";
import { getMerchant } from "@/lib/merchants";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireMerchant();
  const merchant = await getMerchant(user.sub);
  // Sandbox means no real money is moving — say so loudly in the bar.
  const testMode = (process.env.PAY_PROVIDER ?? "sandbox").toLowerCase() === "sandbox";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-900 text-slate-50">
      {/*
        The Sidebar is a fixed/static hybrid component.
        It handles its own width and mobile overlay state.
      */}
      <Sidebar />

      {/*
        Main Content Area
        - flex-1: Takes up remaining width next to the sidebar
        - overflow-y-auto: Allows the main content to scroll while the sidebar stays fixed
        - pt-16 md:pt-0: Adds padding on mobile so content isn't hidden behind the mobile top-nav
      */}
      <main className="relative flex-1 overflow-y-auto pt-16 md:pt-0">
        <TopBar
          name={user.name}
          email={user.email}
          businessName={merchant?.businessName}
          testMode={testMode}
        />
        <div className="mx-auto max-w-7xl p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
