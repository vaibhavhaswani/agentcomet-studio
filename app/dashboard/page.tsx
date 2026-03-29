export const dynamic = "force-dynamic";

import Link from "next/link";
import { PlusCircle, KeyRound, LayoutGrid, Server, UploadCloud } from "lucide-react";
import { redirect } from "next/navigation";
import { ApiKeySummaryCard } from "@/components/ApiKeysClient";
import DashboardAgentList from "@/components/DashboardAgentList";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { getCurrentUser, getUserApiKeys } from "@/lib/auth";
import { getDashboardAgents } from "@/lib/agent-service";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const agents = getDashboardAgents(user.id).map((agent) => ({ ...agent }));
  const apiKeys = getUserApiKeys(user.id);
  const currentKey = apiKeys.find((key) => !key.revoked_at) ?? apiKeys[0] ?? null;

  return (
    <div className="min-h-screen text-brand-text-primary">
      <Navbar user={user} />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center space-x-2 rounded-full border border-brand-accent/20 bg-brand-accent/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-accent">
              <Server className="h-3 w-3" />
              <span>Local instance</span>
            </div>
            <h1 className="mb-2 text-3xl font-bold text-brand-text-primary">Dashboard</h1>
            <p className="text-brand-text-secondary">
              Manage local agents, inspect version history, publish selected releases to AgentComet Hub, or register `.uaf` files manually.
            </p>
          </div>

          <div className="w-full max-w-md">
            <ApiKeySummaryCard apiKey={currentKey} />
          </div>
        </div>

        <div className="mb-8 flex flex-col gap-4 md:flex-row">
          <Link
            href="/agents/manual"
            className="inline-flex items-center justify-center space-x-2 rounded-xl bg-brand-accent px-5 py-3 text-sm font-bold text-white transition-all hover:bg-blue-500"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Agent Manually via UAF</span>
          </Link>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { label: "Local agents", value: String(agents.length), icon: LayoutGrid, color: "text-brand-accent" },
            {
              label: "Stored versions",
              value: String(agents.reduce((sum, item) => sum + item.version_count, 0)),
              icon: UploadCloud,
              color: "text-blue-500"
            },
            {
              label: "Active API keys",
              value: String(apiKeys.filter((key) => !key.revoked_at).length),
              icon: KeyRound,
              color: "text-emerald-500"
            }
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl p-6 glass-card">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary">{stat.label}</span>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold text-brand-text-primary">{stat.value}</div>
            </div>
          ))}
        </div>

        {agents.length ? (
          <DashboardAgentList agents={agents} />
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 py-20 text-center glass-card">
            <LayoutGrid className="mx-auto mb-4 h-12 w-12 text-brand-text-secondary/20" />
            <h3 className="mb-2 text-lg font-bold text-brand-text-primary">No local agents yet</h3>
            <p className="mx-auto mb-8 max-w-lg text-brand-text-secondary">
              Push an agent with one of your local API keys or upload a `.uaf` package manually and it will appear here with its latest version, metadata, and downloadable artifact.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

