"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical, Zap } from "lucide-react";
import { setModeAction } from "@/app/dashboard/actions";
import type { Mode } from "@/lib/mode";

/** Test/live view toggle for the merchant dashboard. */
export default function ModeSwitcher({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  // Optimistic highlight so the toggle responds instantly; the server prop
  // re-syncs it once the cookie is set and the route refreshes.
  const [view, setView] = useState<Mode>(mode);
  useEffect(() => setView(mode), [mode]);

  const set = (m: Mode) => {
    if (m === view) return;
    setView(m);
    start(async () => {
      await setModeAction(m);
      router.refresh();
    });
  };

  return (
    <div className={`flex items-center rounded-full border border-slate-700 bg-slate-800/60 p-0.5 text-[11px] font-medium transition-opacity ${pending ? "opacity-70" : ""}`}>
      <button
        type="button"
        onClick={() => set("test")}
        className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 transition ${view === "test" ? "bg-amber-500/20 text-amber-300" : "text-slate-400 hover:text-slate-200"}`}
      >
        <FlaskConical size={11} /> Test
      </button>
      <button
        type="button"
        onClick={() => set("live")}
        className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 transition ${view === "live" ? "bg-emerald-500/20 text-emerald-300" : "text-slate-400 hover:text-slate-200"}`}
      >
        <Zap size={11} /> Live
      </button>
    </div>
  );
}
