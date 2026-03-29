import { NextResponse } from "next/server";
import { registerLocalUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    }
    const result = await registerLocalUser({
      name: body.name,
      email: body.email.toLowerCase(),
      password: body.password
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create account." },
      { status: 400 }
    );
  }
}

