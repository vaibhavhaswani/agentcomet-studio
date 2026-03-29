#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawn } from "node:child_process";

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    if (!key || process.env[key]) {
      continue;
    }

    const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");
    process.env[key] = value;
  }
}

const cwd = process.cwd();
loadEnvFile(resolve(cwd, ".env"));
loadEnvFile(resolve(cwd, ".env.local"));

const command = process.argv[2] ?? "dev";
const port = process.env.AGENTCOMET_PORT ?? process.env.PORT ?? "3451";
process.env.PORT = port;
process.env.NEXT_PUBLIC_APP_PORT = process.env.NEXT_PUBLIC_APP_PORT ?? port;
process.env.NEXT_PUBLIC_APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? `http://localhost:${process.env.NEXT_PUBLIC_APP_PORT}`;

const child = spawn(
  process.execPath,
  [resolve(cwd, "node_modules", "next", "dist", "bin", "next"), command, ...(command === "dev" || command === "start" ? ["-p", port] : [])],
  {
    stdio: "inherit",
    env: process.env
  }
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
