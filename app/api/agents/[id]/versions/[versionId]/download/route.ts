import { basename } from "node:path";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getOwnedAgent } from "@/lib/agent-service";
import { getVersionForAgent } from "@/lib/db";
import { artifactExists, readArtifact } from "@/lib/storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id, versionId } = await params;
  const agent = getOwnedAgent(id, user.id);
  if (!agent) {
    return NextResponse.json({ error: "Agent not found." }, { status: 404 });
  }

  const version = getVersionForAgent(id, versionId);
  if (!version || !artifactExists(version.artifact_path)) {
    return NextResponse.json({ error: "Artifact not found." }, { status: 404 });
  }

  const file = readArtifact(version.artifact_path);
  return new NextResponse(file, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${basename(version.artifact_file_name)}"`
    }
  });
}

