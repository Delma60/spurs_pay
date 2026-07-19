"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, X, Loader2 } from "lucide-react";
import { refundAction } from "@/app/dashboard/actions";

export default function RefundButton({ reference, remainingMinor, decimals = 2 }: { reference: string; remainingMinor: number; decimals?: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState((remainingMinor / 10 ** decimals).toString());
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const minor = Math.round(Number(amount) * 10 ** decimals);
      await refundAction(reference, minor, reason || undefined);
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex h-9 items-center gap-2 rounded-lg border border-neutral-300 px-3.5 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800">
        <RotateCcw size={15} /> Refund
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Refund payment</h2>
              <button onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"><X size={16} /></button>
            </div>
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-neutral-500">Amount</span>
                <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" className="h-10 w-full rounded-lg border border-neutral-300 bg-transparent px-3 text-sm outline-none focus:border-indigo-500 dark:border-neutral-700" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-neutral-500">Reason (optional)</span>
                <input value={reason} onChange={(e) => setReason(e.target.value)} className="h-10 w-full rounded-lg border border-neutral-300 bg-transparent px-3 text-sm outline-none focus:border-indigo-500 dark:border-neutral-700" />
              </label>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button onClick={submit} disabled={busy} className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60">
                {busy && <Loader2 size={15} className="animate-spin" />} Confirm refund
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
