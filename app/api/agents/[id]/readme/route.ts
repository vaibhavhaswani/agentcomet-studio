import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { saveAgentReadme } from "@/lib/agent-service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { readme?: string | null };
  const updated = saveAgentReadme(user.id, id, typeof body.readme === "string" ? body.readme : null);

  if (!updated) {
    return NextResponse.json({ error: "Agent not found." }, { status: 404 });
  }

  return NextResponse.json({ agent: updated });
}
