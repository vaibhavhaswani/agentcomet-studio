'use client';

import ReactMarkdown from "react-markdown";
import { FileText, Pencil, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ReadmeEditorCardProps = {
  agentId: string;
  initialReadme: string | null;
  startEditing?: boolean;
};

export default function ReadmeEditorCard({ agentId, initialReadme, startEditing = false }: ReadmeEditorCardProps) {
  const router = useRouter();
  const [readme, setReadme] = useState(initialReadme ?? "");
  const [draft, setDraft] = useState(initialReadme ?? "");
  const [editing, setEditing] = useState(startEditing || !initialReadme);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveReadme() {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/agents/${agentId}/readme`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ readme: draft.trim() ? draft : null })
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error ?? "Failed to save README.");
      }
      setReadme(json.agent.readme ?? "");
      setDraft(json.agent.readme ?? "");
      setEditing(false);
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save README.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl p-8 glass-card" id="readme">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-brand-accent" />
          <h2 className="text-2xl font-bold">Readme</h2>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setDraft(readme);
                  setEditing(false);
                  setError(null);
                }}
                className="rounded-lg p-2 text-brand-text-secondary transition-colors hover:bg-white/10 hover:text-brand-text-primary"
                aria-label="Cancel README edit"
                title="Cancel"
              >
                <X className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={saveReadme}
                disabled={saving}
                className="inline-flex items-center rounded-lg bg-brand-accent px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Markdown"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-brand-text-primary transition-colors hover:bg-white/[0.1]"
              aria-label={readme ? "Edit README" : "Add README"}
              title={readme ? "Edit README" : "Add README"}
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <div className="space-y-4">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={18}
            placeholder="# Agent README\n\nWrite markdown here. It will render like GitHub-style content in the UI."
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-sm text-brand-text-primary placeholder:text-brand-text-secondary/30 focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
          />
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
        </div>
      ) : (
        <div className="max-w-none space-y-4 text-sm leading-7 text-brand-text-secondary">
          {readme ? (
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="mt-8 text-3xl font-bold text-brand-text-primary first:mt-0">{children}</h1>,
                h2: ({ children }) => <h2 className="mt-8 text-2xl font-bold text-brand-text-primary first:mt-0">{children}</h2>,
                h3: ({ children }) => <h3 className="mt-6 text-xl font-bold text-brand-text-primary">{children}</h3>,
                p: ({ children }) => <p className="text-brand-text-secondary">{children}</p>,
                ul: ({ children }) => <ul className="list-disc space-y-2 pl-6 text-brand-text-secondary">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal space-y-2 pl-6 text-brand-text-secondary">{children}</ol>,
                li: ({ children }) => <li>{children}</li>,
                code: ({ children }) => (
                  <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-xs text-brand-text-primary">{children}</code>
                ),
                pre: ({ children }) => <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-4">{children}</pre>,
                a: ({ href, children }) => (
                  <a href={href} className="text-brand-accent underline underline-offset-4">
                    {children}
                  </a>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-brand-accent/40 pl-4 italic text-brand-text-secondary">
                    {children}
                  </blockquote>
                )
              }}
            >
              {readme}
            </ReactMarkdown>
          ) : (
            <p>No README has been provided for this agent yet. Use the edit icon to add one in markdown.</p>
          )}
        </div>
      )}
    </section>
  );
}
