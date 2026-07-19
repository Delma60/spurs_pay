import { CreditCard, Plus } from "lucide-react";
import { requireMerchant } from "@/lib/auth";
import { listCards } from "@/lib/cards";
import { formatAmount } from "@/lib/format";
import { Card, PageHeader } from "@/components/pay-ui";
import FreezeButton from "./FreezeButton";
import { issueCardAction } from "../actions";

export default async function CardsPage() {
  const user = await requireMerchant();
  const cards = await listCards(user.sub);

  return (
    <div>
      <PageHeader
        title="Cards"
        subtitle="Issue virtual cards to spend from your balance."
        action={
          <form action={issueCardAction} className="flex gap-2">
            <input name="label" placeholder="Label" className="h-9 w-28 rounded-lg border border-neutral-300 bg-transparent px-3 text-sm outline-none focus:border-indigo-500 dark:border-neutral-700" />
            <input name="balance" inputMode="decimal" placeholder="₦ balance" className="h-9 w-28 rounded-lg border border-neutral-300 bg-transparent px-3 text-sm outline-none focus:border-indigo-500 dark:border-neutral-700" />
            <button className="flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-3.5 text-sm font-medium text-white hover:bg-indigo-700"><Plus size={16} /> Issue</button>
          </form>
        }
      />

      {cards.length === 0 ? (
        <Card className="flex flex-col items-center px-5 py-14 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-neutral-100 text-neutral-400 dark:bg-neutral-800"><CreditCard size={22} /></span>
          <p className="mt-4 text-sm font-medium">No cards issued</p>
          <p className="mt-1 max-w-xs text-sm text-neutral-500">Issue a virtual card to make online payments from your Spurs Pay balance.</p>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {cards.map((c) => (
            <div key={c.id}>
              <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-5 text-white shadow-lg ${c.frozen ? "opacity-60" : ""}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{c.label}</span>
                  <CreditCard size={20} className="opacity-80" />
                </div>
                <div className="mt-6 font-mono text-lg tracking-widest">•••• •••• •••• {c.last4}</div>
                <div className="mt-4 flex items-end justify-between text-xs">
                  <div>
                    <div className="opacity-70">Expires</div>
                    <div className="font-medium">{c.expMonth}/{c.expYear}</div>
                  </div>
                  <div className="text-right">
                    <div className="opacity-70">Balance</div>
                    <div className="text-base font-semibold">{formatAmount(c.balance, c.currency)}</div>
                  </div>
                </div>
                {c.frozen && <span className="absolute right-3 top-14 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium">Frozen</span>}
              </div>
              <div className="mt-2 flex justify-between px-1 text-neutral-500">
                <span className="text-xs">{c.brand} · virtual</span>
                <FreezeButton id={c.id} frozen={c.frozen} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
