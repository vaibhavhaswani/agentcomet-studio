'use client';

import { Eye, EyeOff, KeyRound, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type ApiKeyItem = {
  id: string;
  name: string;
  prefix: string;
  value: string | null;
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

function formatDate(value: string | null) {
  if (!value) {
    return "Never";
  }
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function ApiKeySummaryCard({ apiKey }: { apiKey: ApiKeyItem | null }) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push("/api-keys")}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push("/api-keys");
        }
      }}
      className="cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-4 glass-card"
    >
      <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-widest text-brand-text-secondary">
        <span>Active local API key</span>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setVisible((current) => !current);
          }}
          className="rounded-lg p-2 text-brand-text-secondary transition-colors hover:bg-white/10 hover:text-brand-text-primary"
          aria-label={visible ? "Hide API key" : "Show API key"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex items-start space-x-2 text-sm text-brand-text-primary">
        <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
        <div className="min-w-0 flex-1 overflow-hidden">
          <span className={`block font-medium ${visible ? "break-all whitespace-normal" : "truncate"}`}>
            {apiKey ? (visible ? apiKey.value ?? `${apiKey.prefix}...` : `${apiKey.prefix}...`) : "No API key yet"}
          </span>
        </div>
      </div>
      {apiKey ? (
        <p className="mt-2 text-xs text-brand-text-secondary">
          Created {formatDate(apiKey.created_at)}. Click to manage keys.
        </p>
      ) : (
        <p className="mt-2 text-xs text-brand-text-secondary">Click to create and manage API keys.</p>
      )}
    </div>
  );
}

export function ApiKeysManager({ initialKeys }: { initialKeys: ApiKeyItem[] }) {
  const [keys, setKeys] = useState<ApiKeyItem[]>(initialKeys);
  const [newKeyName, setNewKeyName] = useState("Local SDK key");
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

  async function createKey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsCreating(true);
    try {
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: newKeyName })
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error ?? "Failed to create API key.");
      }
      setKeys(json.keys);
      if (json.keys?.[0]?.id) {
        setVisibleKeys((current) => ({ ...current, [json.keys[0].id]: true }));
      }
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create API key.");
    } finally {
      setIsCreating(false);
    }
  }

  async function deleteKey(id: string) {
    setError(null);
    setDeletingId(id);
    try {
      const response = await fetch("/api/api-keys", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id })
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error ?? "Failed to delete API key.");
      }
      setKeys(json.keys);
      setVisibleKeys((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete API key.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-white/10 p-8 glass-card">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center space-x-2 rounded-full border border-brand-accent/20 bg-brand-accent/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-accent">
              <ShieldCheck className="h-3 w-3" />
              <span>Secure local access</span>
            </div>
            <h1 className="text-3xl font-bold text-brand-text-primary">API Key Management</h1>
            <p className="mt-2 text-brand-text-secondary">
              Create local SDK keys, reveal stored keys when needed, and use them to push agents into this instance.
            </p>
          </div>
        </div>

        <form onSubmit={createKey} className="grid gap-4 md:grid-cols-[1fr_auto]">
          <input
            value={newKeyName}
            onChange={(event) => setNewKeyName(event.target.value)}
            placeholder="Local SDK key"
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-brand-text-primary placeholder:text-brand-text-secondary/30 focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
          />
          <button
            type="submit"
            disabled={isCreating}
            className="flex items-center justify-center space-x-2 rounded-xl bg-brand-accent px-5 py-3 font-bold text-white transition-all hover:bg-blue-500 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            <span>{isCreating ? "Creating..." : "Create API Key"}</span>
          </button>
        </form>

        {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
      </div>

      <div className="space-y-4">
        {keys.map((key) => {
          const visible = !!visibleKeys[key.id];
          return (
            <div key={key.id} className="rounded-2xl border border-white/10 p-6 glass-card">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-brand-text-primary">{key.name}</h2>
                  <p className="mt-1 text-sm text-brand-text-secondary">
                    Created {formatDate(key.created_at)}. Last used {formatDate(key.last_used_at)}.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVisibleKeys((current) => ({ ...current, [key.id]: !visible }))}
                    className="rounded-lg p-2 text-brand-text-secondary transition-colors hover:bg-white/10 hover:text-brand-text-primary"
                    aria-label={visible ? "Hide API key" : "Show API key"}
                  >
                    {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteKey(key.id)}
                    disabled={deletingId === key.id}
                    className="rounded-lg p-2 text-brand-text-secondary transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                    aria-label="Delete API key"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm text-brand-text-primary">
                <span className={`block ${visible ? "break-all whitespace-normal" : "truncate"}`}>
                  {visible ? key.value ?? `${key.prefix}...` : `${key.prefix}...`}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-brand-text-secondary">
                <span>{key.revoked_at ? `Revoked ${formatDate(key.revoked_at)}` : "Active key"}</span>
                <span>Stored locally and encrypted at rest</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
