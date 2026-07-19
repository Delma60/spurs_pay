import { requireMerchant } from "@/lib/auth";
import { getMerchant } from "@/lib/merchants";
import { Card, PageHeader } from "@/components/pay-ui";
import { saveSettingsAction, regenSecretAction } from "../actions";

export default async function SettingsPage() {
  const user = await requireMerchant();
  const merchant = await getMerchant(user.sub);

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Settings" subtitle="Your business profile and webhook configuration." />

      <Card className="p-5">
        <form action={saveSettingsAction} className="space-y-4">
          <h2 className="text-sm font-medium">Business profile</h2>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-neutral-500">Business name</span>
            <input name="businessName" defaultValue={merchant?.businessName ?? ""} className="h-10 w-full rounded-lg border border-neutral-300 bg-transparent px-3 text-sm outline-none focus:border-indigo-500 dark:border-neutral-700" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-neutral-500">Contact email</span>
            <input value={merchant?.email ?? user.email ?? ""} readOnly className="h-10 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950" />
          </label>

          <h2 className="pt-2 text-sm font-medium">Webhook</h2>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-neutral-500">Webhook URL</span>
            <input name="webhookUrl" type="url" defaultValue={merchant?.webhookUrl ?? ""} placeholder="https://your-app.com/webhooks/spurs-pay" className="h-10 w-full rounded-lg border border-neutral-300 bg-transparent px-3 text-sm outline-none focus:border-indigo-500 dark:border-neutral-700" />
            <span className="mt-1 block text-xs text-neutral-400">We POST signed events here (header <code>x-spurs-signature</code>).</span>
          </label>

          <button className="h-10 rounded-lg bg-indigo-600 px-5 text-sm font-medium text-white hover:bg-indigo-700">Save changes</button>
        </form>
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-medium">Webhook signing secret</h2>
        <p className="mt-1 text-sm text-neutral-500">Verify inbound events by checking the HMAC-SHA256 signature with this secret.</p>
        <div className="mt-3 flex items-center gap-2">
          <input value={merchant?.webhookSecret ?? ""} readOnly className="h-10 min-w-0 flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 font-mono text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950" />
          <form action={regenSecretAction}>
            <button className="h-10 whitespace-nowrap rounded-lg border border-neutral-300 px-4 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800">Regenerate</button>
          </form>
        </div>
        <p className="mt-2 text-xs text-amber-600 dark:text-amber-500">Regenerating immediately invalidates the old secret.</p>
      </Card>
    </div>
  );
}
