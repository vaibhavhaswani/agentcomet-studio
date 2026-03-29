'use client';

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CodeBlock({
  code,
  language = "bash"
}: {
  code: string;
  language?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyToClipboard() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="relative overflow-hidden rounded-lg border border-white/10 bg-zinc-900">
      <div className="flex items-center justify-between border-b border-white/5 bg-zinc-800/50 px-4 py-2">
        <span className="text-xs font-mono text-gray-400">{language}</span>
        <button
          type="button"
          onClick={copyToClipboard}
          className="rounded p-1 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm text-gray-300">
        <code>{code}</code>
      </pre>
    </div>
  );
}

