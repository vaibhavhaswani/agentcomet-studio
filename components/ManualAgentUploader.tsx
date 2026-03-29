'use client';

import { Upload, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type ManualAgentUploaderProps = {
  existingAgent?: {
    id: string;
    name: string;
    description: string;
    readme: string | null;
  } | null;
};

export default function ManualAgentUploader({ existingAgent }: ManualAgentUploaderProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const file = formData.get("artifact");
      if (!(file instanceof File) || !file.name.toLowerCase().endsWith(".uaf")) {
        throw new Error("Please upload a valid .uaf artifact.");
      }

      const response = await fetch("/api/manual-agents", {
        method: "POST",
        body: formData
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error ?? "Failed to save agent.");
      }

      router.push(`/agents/${json.agent.id}`);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save agent.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-white/10 p-8 glass-card">
      {existingAgent ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-brand-text-secondary">
          This upload creates a new version for the existing agent. Agent name and description stay unchanged here. If this upload includes README markdown, the current README will be updated.
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        {existingAgent ? <input type="hidden" name="agentId" value={existingAgent.id} /> : null}

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary">Agent Name</label>
          <input
            required
            name="name"
            defaultValue={existingAgent?.name ?? ""}
            readOnly={Boolean(existingAgent)}
            placeholder="Research Pro"
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-brand-text-primary placeholder:text-brand-text-secondary/30 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 read-only:cursor-not-allowed read-only:opacity-70"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary">Description</label>
          <textarea
            required
            name="description"
            defaultValue={existingAgent?.description ?? ""}
            readOnly={Boolean(existingAgent)}
            placeholder="Describe what this agent does and what makes this version useful."
            rows={4}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-brand-text-primary placeholder:text-brand-text-secondary/30 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 read-only:cursor-not-allowed read-only:opacity-70"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary">Version</label>
          <input
            required
            name="version"
            placeholder="1.0.0"
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-brand-text-primary placeholder:text-brand-text-secondary/30 focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary">Release Notes</label>
          <textarea
            name="notes"
            placeholder="What changed in this upload?"
            rows={3}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-brand-text-primary placeholder:text-brand-text-secondary/30 focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary">README</label>
          <textarea
            name="readme"
            defaultValue={existingAgent?.readme ?? ""}
            placeholder="Add usage notes, prompts, or setup instructions in markdown."
            rows={6}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-sm text-brand-text-primary placeholder:text-brand-text-secondary/30 focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary">Metadata JSON</label>
          <textarea
            name="metadata"
            placeholder='{"framework":"AgentComet","runtime":"local"}'
            rows={4}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-sm text-brand-text-primary placeholder:text-brand-text-secondary/30 focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary">UAF Artifact</label>
          <input
            required
            type="file"
            name="artifact"
            accept=".uaf"
            className="w-full rounded-xl border border-dashed border-white/20 bg-white/[0.03] px-4 py-3 text-sm text-brand-text-secondary file:mr-4 file:rounded-lg file:border-0 file:bg-brand-accent file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-blue-500"
          />
        </div>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center justify-center space-x-2 rounded-xl bg-brand-accent px-6 py-3 font-bold text-white transition-all hover:bg-blue-500 disabled:opacity-50"
      >
        {existingAgent ? <Upload className="h-4 w-4" /> : <Save className="h-4 w-4" />}
        <span>{isSubmitting ? "Saving..." : existingAgent ? "Upload New Agent Version" : "Add Agent Manually"}</span>
      </button>
    </form>
  );
}
