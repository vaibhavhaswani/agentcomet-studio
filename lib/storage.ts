import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

export function writeAgentArtifact(input: {
  agentId: string;
  versionId: string;
  fileName: string;
  buffer: Buffer;
  metadata: Record<string, unknown>;
}) {
  const baseDir = join(process.cwd(), "data", "agents", input.agentId, "versions", input.versionId);
  mkdirSync(baseDir, { recursive: true });
  const artifactPath = join(baseDir, input.fileName);
  const manifestPath = join(baseDir, "manifest.json");
  writeFileSync(artifactPath, input.buffer);
  writeFileSync(manifestPath, JSON.stringify(input.metadata, null, 2));
  const hash = createHash("sha256").update(input.buffer).digest("hex");
  return {
    artifactPath,
    artifactSize: statSync(artifactPath).size,
    artifactSha256: hash,
    manifestPath
  };
}

export function readArtifact(path: string) {
  return readFileSync(path);
}

export function artifactExists(path: string) {
  return existsSync(path);
}

