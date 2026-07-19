import { requireMerchant } from "@/lib/auth";
import { listKeys } from "@/lib/merchants";
import { PageHeader } from "@/components/pay-ui";
import KeysManager from "./KeysManager";

export default async function KeysPage() {
  const user = await requireMerchant();
  const keys = await listKeys(user.sub);
  const serialized = keys.map((k) => ({
    id: k.id,
    name: k.name,
    prefix: k.prefix,
    revoked: k.revoked,
    createdAt: k.createdAt.toISOString(),
    lastUsedAt: k.lastUsedAt ? k.lastUsedAt.toISOString() : null,
  }));

  return (
    <div className="max-w-3xl">
      <PageHeader title="API keys" subtitle="Keys let your app create and verify payments." />
      <KeysManager keys={serialized} />
      <p className="mt-3 text-xs text-neutral-500">
        Base URL <code>/api/v1/payments</code>. Keep secret keys server-side — never ship them to the browser.
      </p>
    </div>
  );
}
