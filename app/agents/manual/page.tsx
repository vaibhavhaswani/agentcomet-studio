export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { ChevronRight, Upload } from "lucide-react";
import Link from "next/link";
import Footer from "@/components/Footer";
import ManualAgentUploader from "@/components/ManualAgentUploader";
import Navbar from "@/components/Navbar";
import { getCurrentUser } from "@/lib/auth";
import { getOwnedAgent } from "@/lib/agent-service";

export default async function ManualAgentPage({
  searchParams
}: {
  searchParams: Promise<{ agentId?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { agentId } = await searchParams;
  const existingAgent = agentId ? getOwnedAgent(agentId, user.id) : null;
  if (agentId && !existingAgent) {
    notFound();
  }

  return (
    <div className="min-h-screen text-brand-text-primary">
      <Navbar user={user} />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center space-x-2 text-xs font-medium uppercase tracking-wider text-brand-text-secondary">
          <Link href="/dashboard" className="transition-colors hover:text-brand-accent">
            Dashboard
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-brand-text-primary opacity-80">
            {existingAgent ? `Upload Version for ${existingAgent.name}` : "Add Agent Manually"}
          </span>
        </nav>

        <div className="mb-8">
          <div className="mb-3 inline-flex items-center space-x-2 rounded-full border border-brand-accent/20 bg-brand-accent/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-accent">
            <Upload className="h-3 w-3" />
            <span>Manual UAF upload</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-brand-text-primary">
            {existingAgent ? "Upload a New Agent Version Manually" : "Add an Agent Manually"}
          </h1>
          <p className="text-brand-text-secondary">
            Fill in the agent metadata, upload a `.uaf` package, and register it directly in your local AgentComet instance.
          </p>
        </div>

        <ManualAgentUploader
          existingAgent={
            existingAgent
              ? {
                  id: existingAgent.id,
                  name: existingAgent.name,
                  description: existingAgent.description,
                  readme: existingAgent.readme
                }
              : null
          }
        />
      </main>

      <Footer />
    </div>
  );
}
