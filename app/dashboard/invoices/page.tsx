import Link from "next/link";
import { requireMerchant } from "@/lib/auth";
import { listInvoices } from "@/lib/invoices";
import { formatAmount } from "@/lib/format";
import { Card, PageHeader } from "@/components/pay-ui";
import NewInvoice from "./NewInvoice";

const STATUS: Record<string, string> = {
  open: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  paid: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  void: "bg-neutral-500/10 text-neutral-500",
};

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireMerchant();
  const { error } = await searchParams;
  const invoices = await listInvoices(user.sub);

  return (
    <div>
      <PageHeader title="Invoices" subtitle="Bill customers and get paid through hosted checkout." action={<NewInvoice />} />
      {error && <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-600 dark:text-red-300">{error}</div>}

      <Card>
        {invoices.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-neutral-500">No invoices yet. Create one to bill a customer.</p>
        ) : (
          <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {invoices.map((i) => (
              <li key={i.id}>
                <Link href={`/dashboard/invoices/${i.id}`} className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{i.number} · {i.customerEmail}</div>
                    <div className="text-xs text-neutral-500">{i.description ?? "—"} · {new Date(i.createdAt).toLocaleDateString()}</div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${STATUS[i.status] ?? ""}`}>{i.status}</span>
                  <div className="w-24 text-right text-sm font-semibold">{formatAmount(i.amount, i.currency)}</div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
