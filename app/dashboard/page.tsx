import Link from "next/link";
import { requireMerchant } from "@/lib/auth";
import { getMerchant } from "@/lib/merchants";
import { listPayments, computeStats } from "@/lib/payments";
import { formatAmount } from "@/lib/format";
import { Card, StatCard, PaymentsList } from "@/components/pay-ui";
import VolumeChart from "@/components/VolumeChart";

export default async function Overview() {
  const user = await requireMerchant();
  const [merchant, all] = await Promise.all([getMerchant(user.sub), listPayments(user.sub, { limit: 500 })]);
  const stats = computeStats(all);
  const recent = all.slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-neutral-500">{merchant?.businessName ?? "Your business"}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Net collected" value={formatAmount(stats.net, "NGN")} accent="text-emerald-600 dark:text-emerald-400" hint={stats.refunded ? `${formatAmount(stats.refunded, "NGN")} refunded` : undefined} />
        <StatCard label="Successful" value={String(stats.successful)} hint="payments" />
        <StatCard label="Success rate" value={`${stats.successRate}%`} hint={`${stats.total} total`} />
        <StatCard label="Failed" value={String(stats.failed)} />
      </div>

      <Card className="p-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-medium">Successful volume</h2>
          <span className="text-xs text-neutral-500">NGN</span>
        </div>
        <VolumeChart points={stats.series} />
      </Card>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">Recent payments</h2>
          <Link href="/dashboard/payments" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">View all</Link>
        </div>
        <Card>
          <PaymentsList payments={recent} empty="No payments yet. Share a checkout link or use the API to take your first payment." />
        </Card>
      </div>
    </div>
  );
}
