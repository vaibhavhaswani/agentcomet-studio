import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAgentVersions, getOwnedAgent, publishAgentToHub } from "@/lib/agent-service";
import { getAgentById } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const agent = getOwnedAgent(id, user.id);
  if (!agent) {
    return NextResponse.json({ error: "Agent not found." }, { status: 404 });
  }

  const fullAgent = getAgentById(id);
  const versions = getAgentVersions(id);
  const latest = versions[0];
  if (!latest || !fullAgent) {
    return NextResponse.json({ error: "No versions available to publish." }, { status: 400 });
  }

  const hubUrl = process.env.AGENTCOMET_HUB_URL;
  if (!hubUrl) {
    return NextResponse.json(
      { error: "Set AGENTCOMET_HUB_URL to enable publish-to-hub." },
      { status: 400 }
    );
  }

  try {
    const body = request.headers.get("content-type")?.includes("application/json")
      ? ((await request.json()) as { visibility?: "private" | "public" })
      : null;
    const publishVisibility = body?.visibility === "public" ? "public" : "private";

    await publishAgentToHub({
      agentId: id,
      hubUrl,
      hubToken: process.env.AGENTCOMET_HUB_TOKEN,
      payload: {
        source: "agentcomet-local",
        agent: {
          ...fullAgent,
          visibility: publishVisibility
        },
        latestVersion: {
          id: latest.id,
          version: latest.version,
          notes: latest.notes,
          createdAt: latest.created_at,
          artifactFileName: latest.artifact_file_name,
          artifactSha256: latest.artifact_sha256,
          artifactSize: latest.artifact_size,
          metadata: latest.metadata_json ? JSON.parse(latest.metadata_json) : null
        }
      }
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Publish failed." },
      { status: 502 }
    );
  }
}

