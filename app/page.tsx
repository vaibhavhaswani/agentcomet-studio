export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Rocket, Server, Zap } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { getCurrentUser } from "@/lib/auth";

const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL ?? `http://localhost:${process.env.NEXT_PUBLIC_APP_PORT ?? "3451"}`;

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-grid-pattern text-brand-text-primary">
      <Navbar />

      <main>
        <section className="relative overflow-hidden pb-28 pt-24">
          <div className="absolute left-1/2 top-0 -z-20 h-[760px] w-full -translate-x-1/2 opacity-30">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,#1e3a8a_0%,transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_40%,#1e40af_0%,transparent_40%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_60%,#1d4ed8_0%,transparent_40%)]" />
          </div>

          <div className="absolute left-1/2 top-1/2 -z-10 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-accent/10 blur-[120px]" />

          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mb-8 inline-flex items-center space-x-2 rounded-full border border-brand-accent/20 bg-brand-accent/10 px-3 py-1 text-xs font-medium text-brand-accent shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <Zap className="h-3 w-3" />
              <span>Self-host AgentComet locally</span>
            </div>

            <h1 className="mb-6 bg-gradient-to-b from-white via-white to-brand-accent/50 bg-clip-text pb-4 text-5xl font-extrabold tracking-tight text-transparent md:text-7xl">
              Run AgentComet on <br className="hidden md:block" /> your own localhost.
            </h1>

            <p className="mx-auto mb-10 max-w-3xl text-xl leading-relaxed text-brand-text-secondary">
              Create a local account, generate an SDK key, push agents into your private registry, and publish to the main AgentComet Hub only when you are ready.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="group relative flex w-full items-center justify-center overflow-hidden rounded-lg bg-brand-accent px-8 py-4 font-semibold text-white shadow-xl shadow-brand-accent/30 transition-all hover:bg-blue-500 sm:w-auto"
              >
                <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-white/10" />
                <span className="relative z-10">Start Local Setup</span>
                <ArrowRight className="relative z-10 ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <div className="rounded-lg border border-white/10 bg-white/5 px-5 py-4 text-sm text-brand-text-secondary">
                Default URL: <span className="font-medium text-brand-text-primary">{publicAppUrl}</span>
              </div>
            </div>

            <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-3">
              {[
                {
                  icon: Rocket,
                  title: "Local account",
                  text: "Start with signup and get a one-time API key for SDK pushes."
                },
                {
                  icon: Server,
                  title: "Private registry",
                  text: "Store agents, versions, and artifacts on disk with SQLite metadata."
                },
                {
                  icon: Zap,
                  title: "Cloud handoff",
                  text: "Push selected local agents to the main AgentComet Hub later."
                }
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-left glass-card">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-accent/10 text-brand-accent">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h2 className="mb-2 text-lg font-bold text-brand-text-primary">{item.title}</h2>
                  <p className="text-sm leading-relaxed text-brand-text-secondary">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
