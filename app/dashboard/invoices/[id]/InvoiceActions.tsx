"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, ExternalLink } from "lucide-react";
import { voidInvoiceAction } from "@/app/dashboard/actions";

export default function InvoiceActions({ id, payLink, canVoid }: { id: string; payLink: string; canVoid: boolean }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  return (
    <div className="space-y-3">
      <div>
        <span className="mb-1.5 block text-xs font-medium text-neutral-500">Payment link</span>
        <div className="flex items-center gap-2">
          <input readOnly value={payLink} className="h-10 min-w-0 flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 font-mono text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950" />
          <button onClick={() => { navigator.clipboard.writeText(payLink); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="grid h-10 w-10 place-items-center rounded-lg border border-neutral-300 dark:border-neutral-700" title="Copy">
            {copied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
          </button>
          <a href={payLink} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-lg border border-neutral-300 dark:border-neutral-700" title="Open checkout"><ExternalLink size={15} /></a>
        </div>
      </div>
      {canVoid && (
        <button
          onClick={async () => { if (confirm("Void this invoice?")) { await voidInvoiceAction(id); router.refresh(); } }}
          className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400"
        >
          Void invoice
        </button>
      )}
    </div>
  );
}
