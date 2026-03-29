import { NextResponse } from "next/server";
import { createAdditionalApiKey, getCurrentUser, getUserApiKeys, removeUserApiKey } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return NextResponse.json({ keys: getUserApiKeys(user.id) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { name?: string };
  createAdditionalApiKey(user.id, body.name?.trim() || "Local SDK key");
  return NextResponse.json({ keys: getUserApiKeys(user.id) });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { id?: string };
  if (!body.id) {
    return NextResponse.json({ error: "API key id is required." }, { status: 400 });
  }

  removeUserApiKey(user.id, body.id);
  return NextResponse.json({ keys: getUserApiKeys(user.id) });
}
