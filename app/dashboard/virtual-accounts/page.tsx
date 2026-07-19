import { Landmark, Plus } from "lucide-react";
import { requireMerchant } from "@/lib/auth";
import { listVirtualAccounts } from "@/lib/virtual-accounts";
import { Card, PageHeader } from "@/components/pay-ui";
import CopyText from "@/components/CopyText";
import { createVirtualAccountAction } from "../actions";

export default async function VirtualAccountsPage() {
  const user = await requireMerchant();
  const accounts = await listVirtualAccounts(user.sub);

  return (
    <div>
      <PageHeader
        title="Virtual accounts"
        subtitle="Dedicated bank accounts that collect transfers straight into your balance."
        action={
          <form action={createVirtualAccountAction} className="flex gap-2">
            <input name="label" placeholder="Label (e.g. Store 1)" className="h-9 rounded-lg border border-neutral-300 bg-transparent px-3 text-sm outline-none focus:border-indigo-500 dark:border-neutral-700" />
            <button className="flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-3.5 text-sm font-medium text-white hover:bg-indigo-700"><Plus size={16} /> Create</button>
          </form>
        }
      />

      {accounts.length === 0 ? (
        <Card className="flex flex-col items-center px-5 py-14 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-neutral-100 text-neutral-400 dark:bg-neutral-800"><Landmark size={22} /></span>
          <p className="mt-4 text-sm font-medium">No virtual accounts yet</p>
          <p className="mt-1 max-w-xs text-sm text-neutral-500">Create a dedicated account number to accept bank transfers automatically.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {accounts.map((a) => (
            <Card key={a.id} className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{a.label}</span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${a.active ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-neutral-500/10 text-neutral-500"}`}>{a.active ? "Active" : "Inactive"}</span>
              </div>
              <div className="mt-4 space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-neutral-500">Bank</span><span className="font-medium">{a.bankName}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">Account</span><CopyText value={a.accountNumber} className="text-sm font-semibold" /></div>
                <div className="flex justify-between"><span className="text-neutral-500">Name</span><span className="text-right text-xs">{a.accountName}</span></div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
