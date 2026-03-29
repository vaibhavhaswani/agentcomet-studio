export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronRight, Clock, Download, FileText, History, Server, Terminal, Upload } from "lucide-react";
import CodeBlock from "@/components/CodeBlock";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PublishButton from "@/components/PublishButton";
import ReadmeEditorCard from "@/components/ReadmeEditorCard";
import { getCurrentUser } from "@/lib/auth";
import { getAgentVersions, getOwnedAgent } from "@/lib/agent-service";
import { getAgentById } from "@/lib/db";
import { bytesToSize, formatDate } from "@/lib/utils";

export default async function AgentDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const { edit } = await searchParams;
  const ownedAgent = getOwnedAgent(id, user.id);
  if (!ownedAgent) {
    notFound();
  }

  const agent = getAgentById(id);
  if (!agent) {
    notFound();
  }
  const versions = getAgentVersions(id);

  return (
    <div className="min-h-screen text-brand-text-primary">
      <Navbar user={user} />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center space-x-2 text-xs font-medium uppercase tracking-wider text-brand-text-secondary">
          <Link href="/dashboard" className="transition-colors hover:text-brand-accent">
            Dashboard
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-brand-text-primary opacity-80">{agent.name}</span>
        </nav>

        <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
          <div className="space-y-8">
            <section className="rounded-2xl p-8 glass-card">
              <div className="mb-4 flex items-center space-x-4">
                <h1 className="text-4xl font-bold tracking-tight text-brand-text-primary">{agent.name}</h1>
                <div className="flex items-center space-x-1 rounded bg-brand-accent/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-accent">
                  <Server className="h-3 w-3" />
                  <span>Local</span>
                </div>
              </div>

              <p className="mb-6 max-w-3xl text-xl leading-relaxed text-brand-text-secondary">{agent.description}</p>

              <div className="flex flex-wrap gap-6 text-sm text-brand-text-secondary">
                <div className="flex items-center">
                  <History className="mr-2 h-4 w-4" />
                  <span>{agent.version_count} stored versions</span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>Created {formatDate(agent.created_at)}</span>
                </div>
                <div className="flex items-center">
                  <Terminal className="mr-2 h-4 w-4" />
                  <span>Latest {agent.latest_version ?? "none"}</span>
                </div>
              </div>
            </section>

            <ReadmeEditorCard
              agentId={agent.id}
              initialReadme={agent.readme}
              startEditing={edit === "readme"}
            />
          </div>

          <aside className="w-full space-y-6 lg:sticky lg:top-24">
            <div className="rounded-2xl p-6 glass-card">
              <h3 className="mb-4 flex items-center text-sm font-bold uppercase tracking-wider text-brand-text-secondary">
                <Terminal className="mr-2 h-4 w-4" />
                Pull locally
              </h3>
              <CodeBlock
                language="python"
                code={`from agentcomet import Agent

agent = Agent.pull_local("${agent.slug}")
# version = "${agent.latest_version ?? "x.x"}"  # flag for specific version`}
              />
            </div>

            <div className="rounded-2xl p-6 glass-card">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-brand-text-secondary">Manual upload</h3>
              <p className="mb-4 text-sm leading-relaxed text-brand-text-secondary">
                Upload a new `.uaf` package manually and register it as a new version for this agent.
              </p>
              <Link
                href={`/agents/manual?agentId=${agent.id}`}
                className="inline-flex items-center rounded-xl bg-brand-accent px-4 py-3 text-sm font-bold text-white transition-all hover:bg-blue-500"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload New Version Manually
              </Link>
            </div>

            <div className="rounded-2xl p-6 glass-card">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-brand-text-secondary">Publish</h3>
              <p className="mb-4 text-sm leading-relaxed text-brand-text-secondary">
                Choose hub visibility and send the latest local metadata and version information to the main AgentComet Hub.
              </p>
              <PublishButton agentId={agent.id} />
            </div>
          </aside>
        </div>

        <div className="overflow-hidden rounded-2xl glass-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-[10px] uppercase tracking-wider text-brand-text-secondary">
              <tr>
                <th className="px-6 py-4 font-semibold">Version</th>
                <th className="px-6 py-4 font-semibold">Uploaded</th>
                <th className="px-6 py-4 font-semibold">Artifact</th>
                <th className="px-6 py-4 font-semibold">Checksum</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {versions.map((version) => (
                <tr key={version.id} className="group transition-colors hover:bg-white/5">
                  <td className="px-6 py-4 font-mono font-bold text-brand-accent">{version.version}</td>
                  <td className="px-6 py-4 text-brand-text-secondary">{formatDate(version.created_at)}</td>
                  <td className="px-6 py-4 text-brand-text-secondary">
                    <div>{version.artifact_file_name}</div>
                    <div className="text-xs opacity-70">{bytesToSize(version.artifact_size)}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-brand-text-secondary">{version.artifact_sha256.slice(0, 12)}...</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/api/agents/${agent.id}/versions/${version.id}/inspect`}
                        className="rounded-lg p-2 text-brand-text-secondary transition-colors hover:bg-white/10 hover:text-brand-text-primary"
                      >
                        <FileText className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/api/agents/${agent.id}/versions/${version.id}/download`}
                        className="rounded-lg p-2 text-brand-text-secondary transition-colors hover:bg-white/10 hover:text-brand-text-primary"
                      >
                        <Download className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <Footer />
    </div>
  );
}

