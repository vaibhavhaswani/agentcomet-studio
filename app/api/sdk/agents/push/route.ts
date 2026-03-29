import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/auth";
import { savePushedAgent } from "@/lib/agent-service";

function getBearerToken(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return null;
  }
  return header.slice("Bearer ".length);
}

export async function POST(request: Request) {
  try {
    const token = getBearerToken(request);
    if (!token) {
      return NextResponse.json({ error: "Missing bearer token." }, { status: 401 });
    }
    const auth = await authenticateApiKey(token);
    if (!auth) {
      return NextResponse.json({ error: "Invalid API key." }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") ?? "";
    let payload: {
      name: string;
      description: string;
      version: string;
      readme: string | null;
      notes: string | null;
      metadata: Record<string, unknown> | null;
      artifactFileName: string;
      artifactBuffer: Buffer;
    };

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const artifact = formData.get("artifact");
      if (!(artifact instanceof File)) {
        return NextResponse.json({ error: "Artifact file is required." }, { status: 400 });
      }

      const readmeValue = String(formData.get("readme") ?? "");
      const notesValue = String(formData.get("notes") ?? "");
      const metadataValue = String(formData.get("metadata") ?? "").trim();

      payload = {
        name: String(formData.get("name") ?? ""),
        description: String(formData.get("description") ?? ""),
        version: String(formData.get("version") ?? ""),
        readme: readmeValue.trim() ? readmeValue : null,
        notes: notesValue.trim() ? notesValue : null,
        metadata: metadataValue ? (JSON.parse(metadataValue) as Record<string, unknown>) : null,
        artifactFileName: artifact.name,
        artifactBuffer: Buffer.from(await artifact.arrayBuffer())
      };
    } else {
      const body = (await request.json()) as {
        name: string;
        description: string;
        version: string;
        readme?: string;
        notes?: string;
        metadata?: Record<string, unknown>;
        artifactBase64?: string;
        artifactFileName?: string;
      };
      if (!body.artifactBase64) {
        return NextResponse.json({ error: "artifactBase64 is required for JSON pushes." }, { status: 400 });
      }
      payload = {
        name: body.name,
        description: body.description,
        version: body.version,
        readme: body.readme && body.readme.trim() ? body.readme : null,
        notes: body.notes && body.notes.trim() ? body.notes : null,
        metadata: body.metadata ?? null,
        artifactFileName: body.artifactFileName ?? "artifact.bin",
        artifactBuffer: Buffer.from(body.artifactBase64, "base64")
      };
    }

    if (!payload.name || !payload.description || !payload.version || !payload.artifactBuffer.length) {
      return NextResponse.json(
        { error: "name, description, version, and artifact are required." },
        { status: 400 }
      );
    }

    const result = await savePushedAgent({
      userId: auth.userId,
      apiKeyId: auth.apiKeyId,
      visibility: "private",
      ...payload
    });

    return NextResponse.json({
      agent: result.agent,
      version: result.version
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Push failed." },
      { status: 400 }
    );
  }
}
