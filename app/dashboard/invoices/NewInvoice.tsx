"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { createInvoiceAction } from "@/app/dashboard/actions";

export default function NewInvoice() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-3.5 text-sm font-medium text-white hover:bg-indigo-700">
        <Plus size={16} /> New invoice
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">New invoice</h2>
              <button onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"><X size={16} /></button>
            </div>
            <form action={createInvoiceAction} className="mt-4 space-y-3">
              <Field label="Customer email"><input name="customerEmail" type="email" required placeholder="customer@example.com" className="fld" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Amount (₦)"><input name="amount" inputMode="decimal" required placeholder="0.00" className="fld" /></Field>
                <Field label="Due date (optional)"><input name="dueDate" type="date" className="fld" /></Field>
              </div>
              <Field label="Description (optional)"><input name="description" placeholder="What's this for?" className="fld" /></Field>
              <button className="mt-1 flex h-10 w-full items-center justify-center rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700">Create invoice</button>
            </form>
          </div>
        </div>
      )}
      <style>{`.fld{height:2.5rem;width:100%;border-radius:.5rem;border:1px solid #d4d4d4;background:transparent;padding:0 .75rem;font-size:.875rem;outline:none}.fld:focus{border-color:#6366f1}`}</style>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-medium text-neutral-500">{label}</span>{children}</label>;
}
