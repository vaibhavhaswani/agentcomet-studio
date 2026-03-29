export const dynamic = "force-dynamic";

import Link from "next/link";
import { Download, Plus, Server, Terminal, Upload } from "lucide-react";
import { redirect } from "next/navigation";
import CodeBlock from "@/components/CodeBlock";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { getCurrentUser } from "@/lib/auth";

const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL ?? `http://localhost:${process.env.NEXT_PUBLIC_APP_PORT ?? "3451"}`;

export default async function SdkSetupPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen text-brand-text-primary">
      <Navbar user={user} />

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center space-x-2 rounded-full border border-brand-accent/20 bg-brand-accent/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-accent">
              <Terminal className="h-3 w-3" />
              <span>SDK Setup</span>
            </div>
            <h1 className="mb-2 text-3xl font-bold text-brand-text-primary">SDK Setup</h1>
            <p className="text-brand-text-secondary">
              Connect the Python SDK to this local instance, push versions directly from code, and pull agents back by slug when needed.
            </p>
          </div>

          <Link
            href="/api-keys"
            className="flex items-center space-x-2 rounded-xl bg-brand-accent px-4 py-3 text-sm font-bold text-white transition-all hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            <span>Manage keys</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <div className="rounded-3xl border border-white/10 p-8 glass-card">
              <div className="mb-6 flex items-center gap-3">
                <Terminal className="h-5 w-5 text-brand-accent" />
                <h2 className="text-2xl font-bold">Connection Setup</h2>
              </div>
              <p className="mb-6 text-sm text-brand-text-secondary">
                Initialize the SDK once with the local URL and one of the API keys generated from this dashboard.
              </p>
              <CodeBlock
                language="python"
                code={`from agentcomet import Settings, Agent

Settings.init(
    AGENTCOMET_LOCAL_URL="${publicAppUrl}",
    AGENTCOMET_LOCAL_KEY="your-local-key"
)`}
              />
            </div>

            <div className="rounded-3xl border border-white/10 p-8 glass-card">
              <div className="mb-6 flex items-center gap-3">
                <Upload className="h-5 w-5 text-brand-accent" />
                <h2 className="text-2xl font-bold">Push from the SDK</h2>
              </div>
              <p className="mb-6 text-sm text-brand-text-secondary">
                Push the current agent to the local server and let the SDK handle dynamic UAF generation with automatic version bumping.
              </p>
              <CodeBlock
                language="python"
                code={`push_result = agent.push_local(version="auto")
print(push_result)`}
              />
            </div>

            <div className="rounded-3xl border border-white/10 p-8 glass-card">
              <div className="mb-6 flex items-center gap-3">
                <Download className="h-5 w-5 text-brand-accent" />
                <h2 className="text-2xl font-bold">Pull from the SDK</h2>
              </div>
              <p className="mb-6 text-sm text-brand-text-secondary">
                Pull the latest uploaded version by slug, or request a specific stored version when you need an exact artifact.
              </p>
              <CodeBlock
                language="python"
                code={`latest_agent = Agent.pull_local("assistant", version="latest")
specific_agent = Agent.pull_local("assistant", version="1.4.0")
print(latest_agent.name)`}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 p-8 glass-card">
            <div className="mb-6 flex items-center gap-3">
              <Server className="h-5 w-5 text-brand-accent" />
              <h2 className="text-2xl font-bold">Instance Defaults</h2>
            </div>
            <div className="space-y-4 text-sm text-brand-text-secondary">
              <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                <div className="mb-1 font-semibold text-brand-text-primary">Local URL</div>
                <div>{publicAppUrl}</div>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                <div className="mb-1 font-semibold text-brand-text-primary">Local key source</div>
                <div>Copy a local API key from the API Keys page.</div>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                <div className="mb-1 font-semibold text-brand-text-primary">Default latest pull</div>
                <div>Use <code>version=&quot;latest&quot;</code> to fetch the newest uploaded release.</div>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                <div className="mb-1 font-semibold text-brand-text-primary">Artifact storage</div>
                <div>`data/agents/&lt;agent_id&gt;/versions/&lt;version_id&gt;/`</div>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                <div className="mb-1 font-semibold text-brand-text-primary">Hub publish target</div>
                <div>`AGENTCOMET_HUB_URL` environment variable</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
