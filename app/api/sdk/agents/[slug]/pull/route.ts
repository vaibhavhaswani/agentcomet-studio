import { basename } from "node:path";
import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/auth";
import { getAgentBySlugForUser, getLatestVersionForAgent, getVersionByLabelForAgent, touchApiKey } from "@/lib/db";
import { artifactExists, readArtifact } from "@/lib/storage";

function getBearerToken(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return null;
  }
  return header.slice("Bearer ".length);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: "Missing bearer token." }, { status: 401 });
  }

  const auth = await authenticateApiKey(token);
  if (!auth) {
    return NextResponse.json({ error: "Invalid API key." }, { status: 401 });
  }

  const { slug } = await params;
  const agent = getAgentBySlugForUser(slug, auth.userId);
  if (!agent) {
    return NextResponse.json({ error: "Agent not found." }, { status: 404 });
  }

  const requestUrl = new URL(request.url);
  const versionLabel = requestUrl.searchParams.get("version")?.trim();
  const version = versionLabel
    ? getVersionByLabelForAgent(agent.id, versionLabel)
    : getLatestVersionForAgent(agent.id);

  if (!version || !artifactExists(version.artifact_path)) {
    return NextResponse.json({ error: "Artifact not found." }, { status: 404 });
  }

  touchApiKey(auth.apiKeyId);

  return new NextResponse(readArtifact(version.artifact_path), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${basename(version.artifact_file_name)}"`,
      "X-AgentComet-Agent": agent.slug,
      "X-AgentComet-Version": version.version
    }
  });
}
