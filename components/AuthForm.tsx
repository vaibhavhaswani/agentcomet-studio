'use client';

import Link from "next/link";
import { ArrowLeft, Lock, Mail, Rocket, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import CodeBlock from "@/components/CodeBlock";

type AuthFormProps = {
  mode: "signup" | "login";
};

const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL ?? `http://localhost:${process.env.NEXT_PUBLIC_APP_PORT ?? "3451"}`;

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<"signup" | "login">(mode);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? "")
    };

    try {
      const response = await fetch(formMode === "signup" ? "/api/auth/signup" : "/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error ?? "Request failed.");
      }
      if (json.apiKey) {
        setGeneratedKey(json.apiKey);
      } else {
        router.replace("/dashboard");
        router.refresh();
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Request failed.");
    } finally {
      setIsLoading(false);
    }
  }

  if (generatedKey) {
    return (
      <div className="w-full max-w-xl">
        <div className="mb-8 text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-accent/10 text-brand-accent shadow-lg shadow-brand-accent/20">
            <Rocket className="h-8 w-8" />
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-brand-text-primary">Local account ready</h1>
          <p className="text-brand-text-secondary">
            This API key is shown once. Use it from the AgentComet SDK to push agents to your local instance.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 shadow-2xl glass-card">
          <CodeBlock code={generatedKey} language="api-key" />
          <div className="mt-6 flex flex-col gap-3 text-sm text-brand-text-secondary">
            <p>Example SDK target:</p>
            <CodeBlock
              language="bash"
              code={`export AGENTCOMET_BASE_URL="${publicAppUrl}"\nexport AGENTCOMET_API_KEY="${generatedKey}"`}
            />
          </div>
          <button
            type="button"
            onClick={() => {
              router.replace("/dashboard");
              router.refresh();
            }}
            className="mt-6 w-full rounded-xl bg-brand-accent py-4 font-bold text-white transition-all hover:bg-brand-accent/90"
          >
            Continue to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <Link
        href="/"
        className="absolute left-8 top-8 flex items-center font-medium text-brand-text-secondary transition-colors hover:text-brand-text-primary"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Link>

      <div className="mb-8 text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-accent/10 text-brand-accent shadow-lg shadow-brand-accent/20">
          <Rocket className="h-8 w-8" />
        </div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-brand-text-primary">
          {formMode === "signup" ? "Create a local account" : "Sign in locally"}
        </h1>
        <p className="text-brand-text-secondary">
          {formMode === "signup"
            ? "Self-host AgentComet on localhost with your own registry and API keys."
            : "Access your local AgentComet instance."}
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 shadow-2xl glass-card">
        {error ? (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-medium text-red-400">
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4">
          {formMode === "signup" ? (
            <div className="space-y-2">
              <label className="ml-1 text-xs font-bold uppercase tracking-widest text-brand-text-secondary">Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-secondary" />
                <input
                  required
                  name="name"
                  placeholder="Name"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-12 pr-4 text-brand-text-primary placeholder:text-brand-text-secondary/30 focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
                />
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="ml-1 text-xs font-bold uppercase tracking-widest text-brand-text-secondary">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-secondary" />
              <input
                required
                type="email"
                name="email"
                placeholder="handle@gmail.com"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-12 pr-4 text-brand-text-primary placeholder:text-brand-text-secondary/30 focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="ml-1 text-xs font-bold uppercase tracking-widest text-brand-text-secondary">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-secondary" />
              <input
                required
                type="password"
                name="password"
                placeholder="********"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-12 pr-4 text-brand-text-primary placeholder:text-brand-text-secondary/30 focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-brand-accent py-4 font-bold text-white transition-all hover:bg-brand-accent/90 disabled:opacity-50"
          >
            {isLoading ? "Processing..." : formMode === "signup" ? "Create local account" : "Sign in"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setFormMode(formMode === "signup" ? "login" : "signup")}
            className="text-sm text-brand-text-secondary transition-colors hover:text-brand-text-primary"
          >
            {formMode === "signup" ? "Already have an account? Sign in" : "Need a local account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}
