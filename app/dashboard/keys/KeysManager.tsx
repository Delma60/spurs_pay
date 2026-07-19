"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Plus, Copy, Check, Trash2, X, Loader2 } from "lucide-react";
import { createKeyAction, revokeKeyAction } from "@/app/dashboard/actions";

interface Key {
  id: string;
  name: string;
  prefix: string;
  revoked: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

export default function KeysManager({ keys }: { keys: Key[] }) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function create() {
    setBusy(true);
    try {
      const { key } = await createKeyAction(name);
      setShowCreate(false);
      setName("");
      setCreated(key);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function revoke(id: string) {
    if (!confirm("Revoke this key? Apps using it stop working immediately.")) return;
    await revokeKeyAction(id);
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900/40">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-medium">Secret keys</h2>
          <p className="mt-1 text-sm text-neutral-500">Authenticate API requests with <code className="text-xs">Authorization: Bearer spk_…</code></p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-3.5 text-sm font-medium text-white hover:bg-indigo-700">
          <Plus size={16} /> New key
        </button>
      </div>

      <div className="mt-4">
        {keys.length === 0 ? (
          <p className="py-6 text-center text-sm text-neutral-500">No API keys yet.</p>
        ) : (
          keys.map((k) => (
            <div key={k.id} className="flex items-center gap-3 border-t border-neutral-100 py-3 first:border-0 dark:border-neutral-800">
              <KeyRound size={16} className="text-neutral-400" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{k.name}</span>
                  {k.revoked && <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] text-red-500">Revoked</span>}
                </div>
                <div className="font-mono text-xs text-neutral-500">{k.prefix}••••••••</div>
              </div>
              <span className="text-xs text-neutral-400">{k.lastUsedAt ? `used ${new Date(k.lastUsedAt).toLocaleDateString()}` : "never used"}</span>
              {!k.revoked && (
                <button onClick={() => revoke(k.id)} className="grid h-8 w-8 place-items-center rounded-lg text-neutral-400 hover:text-red-500" title="Revoke"><Trash2 size={15} /></button>
              )}
            </div>
          ))
        )}
      </div>

      {showCreate && (
        <Modal onClose={() => setShowCreate(false)} title="New API key">
          <input value={name} onChange={(e) => setName(e.target.value)} autoFocus placeholder="e.g. Production server" className="mt-4 h-10 w-full rounded-lg border border-neutral-300 bg-transparent px-3 text-sm outline-none focus:border-indigo-500 dark:border-neutral-700" />
          <div className="mt-5 flex justify-end gap-2">
            <button onClick={() => setShowCreate(false)} className="h-9 rounded-lg border border-neutral-300 px-4 text-sm dark:border-neutral-700">Cancel</button>
            <button onClick={create} disabled={busy} className="flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700">
              {busy && <Loader2 size={14} className="animate-spin" />} Create
            </button>
          </div>
        </Modal>
      )}

      {created && (
        <Modal onClose={() => setCreated(null)} title="Copy your secret key">
          <p className="mt-1 text-sm text-neutral-500">This is the only time it&apos;s shown. Store it securely.</p>
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-950">
            <code className="min-w-0 flex-1 truncate font-mono text-sm text-indigo-600 dark:text-indigo-400">{created}</code>
            <button onClick={() => { navigator.clipboard.writeText(created); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="grid h-8 w-8 place-items-center rounded-lg border border-neutral-300 dark:border-neutral-700">
              {copied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
            </button>
          </div>
          <div className="mt-5 flex justify-end">
            <button onClick={() => setCreated(null)} className="h-9 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700">Done</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
