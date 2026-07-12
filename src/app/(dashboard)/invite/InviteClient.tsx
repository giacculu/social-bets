"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function InviteClient({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const inviteLink = typeof window !== "undefined"
    ? `${window.location.origin}/register?ref=${code}`
    : "";

  function copyLink() {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function copyCode() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg bg-black/30 px-3 py-2">
        <span className="flex-1 truncate text-sm text-gray-300">{inviteLink}</span>
        <button
          type="button"
          onClick={copyLink}
          className="rounded p-1 text-gray-400 hover:text-white transition-colors"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <button
        type="button"
        onClick={copyCode}
        className="w-full rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors"
      >
        {copied ? "Copiato!" : "Copia codice"}
      </button>
    </div>
  );
}
