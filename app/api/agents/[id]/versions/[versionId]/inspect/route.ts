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

  const artifact = readArtifact(version.artifact_path);
  const utf8Content = artifact.toString("utf8");
  const printable = /^[\x09\x0A\x0D\x20-\x7E]*$/.test(utf8Content);

  return NextResponse.json({
    id: version.id,
    version: version.version,
    notes: version.notes,
    createdAt: version.created_at,
    artifactFileName: version.artifact_file_name,
    artifactSize: version.artifact_size,
    artifactSha256: version.artifact_sha256,
    metadata: version.metadata_json ? JSON.parse(version.metadata_json) : null,
    preview: printable ? utf8Content.slice(0, 4000) : null
  });
}

