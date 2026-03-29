'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot, Clock, FileText, History, Server } from "lucide-react";
import type { MouseEvent, KeyboardEvent } from "react";
import type { DashboardAgentRecord } from "@/lib/db";
import { formatRelative } from "@/lib/utils";

export default function AgentCard({ agent }: { agent: DashboardAgentRecord }) {
  const router = useRouter();

  function openAgent() {
    router.push(`/agents/${agent.id}`);
  }

  function handleActionClick(event: MouseEvent<HTMLElement>) {
    event.stopPropagation();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openAgent();
    }
  }

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={openAgent}
      onKeyDown={handleKeyDown}
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl p-6 glass-card focus:outline-none focus:ring-2 focus:ring-brand-accent/60"
      aria-label={`Open ${agent.name}`}
    >
      <div className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute inset-[-100%] animate-gradient-x bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15)_0%,transparent_50%)]" />
      </div>

      <div className="mb-4 flex items-start justify-between">
        <div className="rounded-xl bg-brand-accent/10 p-3 text-brand-accent transition-transform group-hover:scale-110">
          <Bot className="h-6 w-6" />
        </div>
        <div className="flex items-center space-x-3 text-xs text-brand-text-secondary">
          <div className="flex items-center space-x-1 rounded bg-brand-accent/10 px-1.5 py-0.5 text-brand-accent">
            <Server className="h-3 w-3" />
            <span>Local</span>
          </div>
        </div>
      </div>

      <h3 className="mb-2 text-xl font-bold transition-colors group-hover:text-brand-accent">{agent.name}</h3>
      <p className="mb-6 flex-grow text-sm leading-relaxed text-brand-text-secondary">{agent.description}</p>

      <div className="mb-6 flex flex-wrap gap-2">
        <span className="rounded-md bg-white/5 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-brand-text-secondary">
          {agent.latest_version ?? "No versions"}
        </span>
        <span className="rounded-md bg-white/5 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-brand-text-secondary">
          {agent.version_count} versions
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href={`/agents/manual?agentId=${agent.id}`}
          onClick={handleActionClick}
          className="inline-flex items-center rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-brand-text-primary transition-colors hover:bg-white/[0.1]"
        >
          Upload New Version Manually
        </Link>
        <Link
          href={`/agents/${agent.id}${agent.readme ? "" : "?edit=readme#readme"}`}
          onClick={handleActionClick}
          className="inline-flex items-center rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-brand-text-primary transition-colors hover:bg-white/[0.1]"
        >
          <FileText className="mr-2 h-3.5 w-3.5" />
          {agent.readme ? "View README" : "Add README"}
        </Link>
      </div>

      <div className="flex items-center justify-between border-t border-white/5 pt-6">
        <div className="flex items-center space-x-2 text-xs text-brand-text-secondary">
          <History className="h-3 w-3" />
          <span>{agent.latest_version_created_at ? formatRelative(agent.latest_version_created_at) : "No pushes yet"}</span>
        </div>
        <div className="flex items-center text-[10px] font-medium uppercase tracking-wider text-brand-text-secondary">
          <Clock className="mr-1 h-3 w-3" />
          {formatRelative(agent.updated_at)}
        </div>
      </div>
    </div>
  );
}
