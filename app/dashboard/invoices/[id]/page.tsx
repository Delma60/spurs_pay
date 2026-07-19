import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireMerchant } from "@/lib/auth";
import { getInvoice, syncInvoice, invoicePayLink } from "@/lib/invoices";
import { formatAmount } from "@/lib/format";
import { Card, PageHeader } from "@/components/pay-ui";
import InvoiceActions from "./InvoiceActions";

const STATUS: Record<string, string> = {
  open: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  paid: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  void: "bg-neutral-500/10 text-neutral-500",
};

export default async function InvoiceDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireMerchant();
  const { id } = await params;
  let invoice = await getInvoice(user.sub, id);
  if (!invoice) notFound();

  invoice = await syncInvoice(invoice); // reconcile with the linked payment
  const payLink = invoice.status === "open" ? await invoicePayLink(invoice) : null;

  const rows: [string, string][] = [
    ["Invoice", invoice.number],
    ["Customer", invoice.customerEmail],
    ["Description", invoice.description ?? "—"],
    ["Due", invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "—"],
    ["Created", new Date(invoice.createdAt).toLocaleString()],
    ["Paid", invoice.paidAt ? new Date(invoice.paidAt).toLocaleString() : "—"],
  ];

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/invoices" className="mb-4 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"><ArrowLeft size={15} /> Invoices</Link>
      <PageHeader title={formatAmount(invoice.amount, invoice.currency)} subtitle={invoice.number} />
      <div className="mb-4"><span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${STATUS[invoice.status] ?? ""}`}>{invoice.status}</span></div>

      <Card className="p-5">
        <dl className="grid grid-cols-[120px_1fr] gap-y-3 text-sm">
          {rows.map(([k, v]) => (<div key={k} className="contents"><dt className="text-neutral-500">{k}</dt><dd className="min-w-0 break-words">{v}</dd></div>))}
        </dl>
      </Card>

      {payLink && (
        <Card className="mt-4 p-5">
          <InvoiceActions id={invoice.id} payLink={payLink} canVoid={invoice.status === "open"} />
        </Card>
      )}
    </div>
  );
}
