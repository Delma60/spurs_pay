"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyText({ value, className = "" }: { value: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className={`inline-flex items-center gap-1.5 font-mono ${className}`}
      title="Copy"
    >
      {value}
      {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} className="text-neutral-400" />}
    </button>
  );
}
