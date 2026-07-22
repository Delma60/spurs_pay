import Link from "next/link";
import { requireMerchant } from "@/lib/auth";
import { listPayments } from "@/lib/payments";
import { getMode } from "@/lib/mode";
import { Card, PaymentsList, PageHeader } from "@/components/pay-ui";

const FILTERS = [
  { code: "", label: "All" },
  { code: "successful", label: "Successful" },
  { code: "pending", label: "Pending" },
  { code: "failed", label: "Failed" },
  { code: "refunded", label: "Refunded" },
];

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const user = await requireMerchant();
  const { status } = await searchParams;
  const active = FILTERS.some((f) => f.code === status) ? status : undefined;
  const mode = await getMode();
  const payments = await listPayments(user.sub, { status: active || undefined, mode, limit: 200 });

  return (
    <div>
      <PageHeader title="Payments" subtitle="Every payment to your account." />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const on = (f.code || undefined) === active;
          return (
            <Link
              key={f.label}
              href={f.code ? `/dashboard/payments?status=${f.code}` : "/dashboard/payments"}
              className={`rounded-full border px-3 py-1 text-sm transition ${
                on
                  ? "border-indigo-500 bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                  : "border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-400"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <Card>
        <PaymentsList payments={payments} empty={active ? `No ${active} payments.` : "No payments yet."} />
      </Card>
    </div>
  );
}
