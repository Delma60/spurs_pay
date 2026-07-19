import type { ReactNode } from "react";
import Link from "next/link";
import { CreditCard, Landmark, Hash } from "lucide-react";
import type { Payment } from "@/lib/db";
import { formatAmount } from "@/lib/format";

const STATUS: Record<string, { label: string; cls: string }> = {
  successful: { label: "Successful", cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  pending: { label: "Pending", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  failed: { label: "Failed", cls: "bg-red-500/10 text-red-600 dark:text-red-400" },
  refunded: { label: "Refunded", cls: "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400" },
  partially_refunded: { label: "Part. refunded", cls: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
};

const METHOD_ICON: Record<string, ReactNode> = {
  card: <CreditCard size={15} />,
  bank_transfer: <Landmark size={15} />,
  ussd: <Hash size={15} />,
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? { label: status, cls: "bg-neutral-500/10 text-neutral-500" };
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${s.cls}`}>{s.label}</span>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/40 ${className}`}>{children}</div>;
}

export function StatCard({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: string }) {
  return (
    <Card className="p-5">
      <div className="text-sm text-neutral-500">{label}</div>
      <div className={`mt-1.5 text-2xl font-semibold tracking-tight ${accent ?? ""}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-neutral-500">{hint}</div>}
    </Card>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function PaymentsList({ payments, empty }: { payments: Payment[]; empty?: string }) {
  if (payments.length === 0) return <p className="px-5 py-10 text-center text-sm text-neutral-500">{empty ?? "No payments yet."}</p>;
  return (
    <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
      {payments.map((p) => (
        <li key={p.reference}>
          <Link href={`/dashboard/payments/${p.reference}`} className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800">
              {(p.method && METHOD_ICON[p.method]) ?? <CreditCard size={15} />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{p.customerEmail ?? p.description ?? "Payment"}</div>
              <div className="truncate font-mono text-xs text-neutral-500">{p.reference}</div>
            </div>
            <div className="hidden text-xs text-neutral-500 sm:block">{new Date(p.createdAt).toLocaleDateString()}</div>
            <StatusBadge status={p.status} />
            <div className="w-24 shrink-0 text-right text-sm font-semibold">{formatAmount(p.amount, p.currency)}</div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
