import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { saveManualAgent } from "@/lib/agent-service";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const artifact = formData.get("artifact");
    if (!(artifact instanceof File)) {
      return NextResponse.json({ error: "UAF artifact is required." }, { status: 400 });
    }
    if (!artifact.name.toLowerCase().endsWith(".uaf")) {
      return NextResponse.json({ error: "Artifact must be a .uaf file." }, { status: 400 });
    }

    const metadataValue = String(formData.get("metadata") ?? "").trim();
    let metadata: Record<string, unknown> | null = null;
    if (metadataValue) {
      metadata = JSON.parse(metadataValue) as Record<string, unknown>;
    }

    const readmeValue = String(formData.get("readme") ?? "");
    const notesValue = String(formData.get("notes") ?? "");

    const result = await saveManualAgent({
      userId: user.id,
      existingAgentId: formData.get("agentId") ? String(formData.get("agentId")) : null,
      name: String(formData.get("name") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      version: String(formData.get("version") ?? "").trim(),
      visibility: "private",
      readme: readmeValue.trim() ? readmeValue : null,
      notes: notesValue.trim() ? notesValue : null,
      metadata,
      artifactFileName: artifact.name,
      artifactBuffer: Buffer.from(await artifact.arrayBuffer())
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save agent." },
      { status: 400 }
    );
  }
}
