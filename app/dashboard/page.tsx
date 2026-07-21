// app/dashboard/page.tsx
import Link from "next/link";
import { requireMerchant } from "@/lib/auth";
import { getMerchant } from "@/lib/merchants";
import { listPayments, computeStats } from "@/lib/payments";
import { formatAmount } from "@/lib/format";
import { Card, StatCard, PaymentsList, PageHeader } from "@/components/pay-ui";
import VolumeChart from "@/components/VolumeChart";
import { Wallet, CheckCircle2, Activity, XCircle } from "lucide-react";

export default async function Overview() {
  const user = await requireMerchant();
  const [merchant, all] = await Promise.all([
    getMerchant(user.sub), 
    listPayments(user.sub, { limit: 500 })
  ]);
  const stats = computeStats(all);
  const recent = all.slice(0, 6);

  // Mocking trends for visual demonstration in B2B SaaS context
  // In a real headless API integration, this would come from a temporal analytics endpoint
  const mockTrends = {
    net: { percentage: 12.5, isPositive: true, timeframe: 'month' },
    successRate: { percentage: 2.1, isPositive: true, timeframe: 'month' }
  };

  return (
    <div className="space-y-8">
      {/* Upgraded Header to use the internal PageHeader component for consistency[cite: 3] */}
      <PageHeader 
        title="Overview" 
        subtitle={merchant?.businessName ?? "Your business"} 
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          label="Net collected" 
          value={formatAmount(stats.net, "NGN")} 
          accent="text-emerald-600 dark:text-emerald-400" 
          hint={stats.refunded ? `${formatAmount(stats.refunded, "NGN")} refunded` : undefined}
          icon={<Wallet size={20} />}
          trend={mockTrends.net}
        />
        <StatCard 
          label="Successful Payments" 
          value={String(stats.successful)} 
          hint="Total completed transactions"
          icon={<CheckCircle2 size={20} />}
          accent="text-blue-600 dark:text-blue-400"
        />
        <StatCard 
          label="Success Rate" 
          value={`${stats.successRate}%`} 
          hint={`${stats.total} total attempts`} 
          icon={<Activity size={20} />}
          trend={mockTrends.successRate}
        />
        <StatCard 
          label="Failed Payments" 
          value={String(stats.failed)} 
          hint="Requires attention"
          icon={<XCircle size={20} />}
          accent="text-red-600 dark:text-red-400"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Expanded Chart Section */}
        <Card className="col-span-full lg:col-span-4 p-6 flex flex-col justify-between">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">Transaction Volume</h2>
              <p className="text-sm text-neutral-500">Successful daily payments (NGN)[cite: 2]</p>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <VolumeChart points={stats.series} />
          </div>
        </Card>

        {/* Recent Payments Section */}
        <div className="col-span-full lg:col-span-3 flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">Recent Activity</h2>
            <Link 
              href="/dashboard/payments" 
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors"
            >
              View ledger
            </Link>
          </div>
          <Card className="flex-1 overflow-hidden">
            <PaymentsList 
              payments={recent} 
              empty="No payments yet. Share a checkout link or use the API to take your first payment." 
            />
          </Card>
        </div>
      </div>
    </div>
  );
}