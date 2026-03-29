'use client';

import { Search, LayoutGrid } from "lucide-react";
import { useMemo, useState } from "react";
import AgentCard from "@/components/AgentCard";
import type { DashboardAgentRecord } from "@/lib/db";

type DashboardAgentListProps = {
  agents: DashboardAgentRecord[];
};

export default function DashboardAgentList({ agents }: DashboardAgentListProps) {
  const [query, setQuery] = useState("");

  const filteredAgents = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return agents;
    }

    return agents.filter((agent) => {
      const haystack = [
        agent.name,
        agent.slug,
        agent.description,
        agent.latest_version ?? "",
        agent.readme ?? ""
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalized);
    });
  }, [agents, query]);

  return (
    <>
      <div className="mb-8 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 glass-card">
        <Search className="h-4 w-4 text-brand-text-secondary" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="This local dashboard lists all agents pushed with your API key or uploaded manually as `.uaf` packages."
          className="w-full bg-transparent text-sm text-brand-text-secondary placeholder:text-brand-text-secondary/70 focus:outline-none"
          aria-label="Search agents"
        />
      </div>

      {filteredAgents.length ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-white/10 py-20 text-center glass-card">
          <LayoutGrid className="mx-auto mb-4 h-12 w-12 text-brand-text-secondary/20" />
          <h3 className="mb-2 text-lg font-bold text-brand-text-primary">No matching agents</h3>
          <p className="mx-auto max-w-lg text-brand-text-secondary">
            Adjust the search term or clear it to see all locally registered agents.
          </p>
        </div>
      )}
    </>
  );
}
