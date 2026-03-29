'use client';

import { ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PublishButton({ agentId }: { agentId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<"private" | "public">("private");

  async function publish() {
    setStatus("loading");
    setMessage(null);
    try {
      const response = await fetch(`/api/agents/${agentId}/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ visibility })
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error ?? "Publish failed.");
      }
      setStatus("done");
      setMessage("Published to AgentComet Hub.");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Publish failed.");
    }
  }

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-widest text-brand-text-secondary">
          Hub Visibility
        </label>
        <select
          value={visibility}
          onChange={(event) => setVisibility(event.target.value as "private" | "public")}
          disabled={status === "loading"}
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-accent/50 disabled:opacity-50"
        >
          <option value="private">Private</option>
          <option value="public">Public</option>
        </select>
      </div>
      <button
        type="button"
        onClick={publish}
        disabled={status === "loading"}
        className="flex items-center justify-center space-x-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-brand-text-primary transition-all hover:bg-white/[0.08] disabled:opacity-50"
      >
        <ExternalLink className="h-4 w-4" />
        <span>{status === "loading" ? "Publishing..." : "Push to AgentComet Hub"}</span>
      </button>
      {message ? (
        <p className={`text-xs ${status === "error" ? "text-red-400" : "text-brand-text-secondary"}`}>{message}</p>
      ) : null}
    </div>
  );
}

