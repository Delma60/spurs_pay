import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireMerchant } from "@/lib/auth";
import { getPayment } from "@/lib/payments";
import { refundsForPayment } from "@/lib/refunds";
import { formatAmount } from "@/lib/format";
import { Card, StatusBadge, PageHeader } from "@/components/pay-ui";
import RefundButton from "./RefundButton";

const METHOD_LABEL: Record<string, string> = { card: "Card", bank_transfer: "Bank transfer", ussd: "USSD" };

export default async function PaymentDetail({ params }: { params: Promise<{ reference: string }> }) {
  const user = await requireMerchant();
  const { reference } = await params;
  const p = await getPayment(reference);
  if (!p || p.merchantId !== user.sub) notFound();

  const refunds = await refundsForPayment(reference);
  const remaining = p.amount - p.refundedAmount;
  const canRefund = (p.status === "successful" || p.status === "partially_refunded") && remaining > 0;

  const rows: [string, string][] = [
    ["Reference", p.reference],
    ["Customer", p.customerEmail ?? "—"],
    ["Method", p.method ? (METHOD_LABEL[p.method] ?? p.method) : "—"],
    ["Description", p.description ?? "—"],
    ["Created", new Date(p.createdAt).toLocaleString()],
    ["Paid", p.paidAt ? new Date(p.paidAt).toLocaleString() : "—"],
  ];

  return (
    <div>
      <Link href="/dashboard/payments" className="mb-4 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
        <ArrowLeft size={15} /> Payments
      </Link>

      <PageHeader
        title={formatAmount(p.amount, p.currency)}
        subtitle={p.reference}
        action={canRefund ? <RefundButton reference={p.reference} remainingMinor={remaining} /> : undefined}
      />

      <div className="mb-4 flex items-center gap-3">
        <StatusBadge status={p.status} />
        {p.refundedAmount > 0 && <span className="text-sm text-neutral-500">{formatAmount(p.refundedAmount, p.currency)} refunded</span>}
      </div>

      <Card className="p-5">
        <dl className="grid grid-cols-[130px_1fr] gap-y-3 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-neutral-500">{k}</dt>
              <dd className="min-w-0 break-words">{k === "Reference" ? <span className="font-mono text-xs">{v}</span> : v}</dd>
            </div>
          ))}
        </dl>
      </Card>

      {refunds.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-neutral-500">Refunds</h2>
          <Card>
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {refunds.map((r) => (
                <li key={r.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div>
                    <div className="font-medium">{formatAmount(r.amount, p.currency)}</div>
                    <div className="text-xs text-neutral-500">{r.reason ?? "No reason"} · {new Date(r.createdAt).toLocaleString()}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
