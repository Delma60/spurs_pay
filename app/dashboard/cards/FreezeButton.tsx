"use client";

import { useRouter } from "next/navigation";
import { Snowflake, Play } from "lucide-react";
import { toggleCardAction } from "@/app/dashboard/actions";

export default function FreezeButton({ id, frozen }: { id: string; frozen: boolean }) {
  const router = useRouter();
  return (
    <button
      onClick={async () => { await toggleCardAction(id, !frozen); router.refresh(); }}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
    >
      {frozen ? <><Play size={13} /> Unfreeze</> : <><Snowflake size={13} /> Freeze</>}
    </button>
  );
}
