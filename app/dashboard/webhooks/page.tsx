import Link from "next/link";
import { Webhook, RefreshCw, CheckCircle2, XCircle, Clock, Settings } from "lucide-react";
import { requireMerchant } from "@/lib/auth";
import { getMerchant } from "@/lib/merchants";
import { listDeliveries, processDueDeliveries } from "@/lib/webhooks";
import { Card, PageHeader } from "@/components/pay-ui";
import { redeliverWebhookAction } from "../actions";

const STATUS: Record<string, { cls: string; icon: typeof Clock }> = {
  delivered: { cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", icon: CheckCircle2 },
  failed: { cls: "bg-red-500/10 text-red-600 dark:text-red-400", icon: XCircle },
  pending: { cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400", icon: Clock },
};

export default async function WebhooksPage() {
  const user = await requireMerchant();
  // Best-effort: retry any deliveries whose backoff is due when the log is viewed.
  void processDueDeliveries();

  const [merchant, deliveries] = await Promise.all([getMerchant(user.sub), listDeliveries(user.sub, 100)]);

  return (
    <div>
      <PageHeader title="Webhooks" subtitle="Every event Spurs Pay sends your endpoint — with retries and redelivery." />

      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 font-medium"><Webhook size={16} className="text-neutral-500" /> Your endpoint</h2>
            {merchant?.webhookUrl ? (
              <p className="mt-1 break-all font-mono text-sm text-neutral-600 dark:text-neutral-300">{merchant.webhookUrl}</p>
            ) : (
              <p className="mt-1 text-sm text-neutral-500">No endpoint set. Add one in Settings to start receiving events.</p>
            )}
            <p className="mt-2 text-xs text-neutral-500">
              Events are signed — verify the <code className="rounded bg-neutral-100 px-1 dark:bg-neutral-800">x-spurs-signature</code> header (HMAC-SHA256 of the body) with your webhook secret. Each event carries a stable <code className="rounded bg-neutral-100 px-1 dark:bg-neutral-800">x-spurs-event-id</code>.
            </p>
          </div>
          <Link href="/dashboard/settings" className="flex h-9 shrink-0 items-center gap-2 rounded-lg border border-neutral-300 px-3 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800">
            <Settings size={15} /> Settings
          </Link>
        </div>
      </Card>

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-neutral-500">Delivery log</h2>
        <Card>
          {deliveries.length === 0 ? (
            <div className="flex flex-col items-center px-5 py-12 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-neutral-100 text-neutral-400 dark:bg-neutral-800"><Webhook size={22} /></span>
              <p className="mt-3 text-sm font-medium">No webhook deliveries yet</p>
              <p className="mt-1 max-w-xs text-sm text-neutral-500">When a payment succeeds, refunds, or fails, the event you receive shows up here.</p>
            </div>
          ) : (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {deliveries.map((d) => {
                const s = STATUS[d.status] ?? STATUS.pending;
                const Icon = s.icon;
                return (
                  <li key={d.id} className="flex items-center gap-3 px-5 py-3.5">
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${s.cls}`}><Icon size={16} /></span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        {d.event}
                        <span className="font-mono text-xs font-normal text-neutral-400">{d.eventId}</span>
                      </div>
                      <div className="truncate text-xs text-neutral-500">
                        {new Date(d.createdAt).toLocaleString()} · attempt {d.attempts}/{d.maxAttempts}
                        {d.lastStatusCode ? ` · HTTP ${d.lastStatusCode}` : ""}
                        {d.status === "failed" && d.lastError ? ` · ${d.lastError}` : ""}
                        {d.status === "failed" && d.nextAttemptAt ? ` · retry ${new Date(d.nextAttemptAt).toLocaleTimeString()}` : ""}
                      </div>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${s.cls}`}>{d.status}</span>
                    <form action={redeliverWebhookAction.bind(null, d.id)}>
                      <button className="flex h-8 items-center gap-1.5 rounded-lg border border-neutral-300 px-2.5 text-xs font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800">
                        <RefreshCw size={13} /> Redeliver
                      </button>
                    </form>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
