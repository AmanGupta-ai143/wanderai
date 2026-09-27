import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, createUser } from "@/lib/server/repository";
import { hashPassword, createSessionToken, setSessionCookie } from "@/lib/server/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { name, email, password } = body ?? {};

  if (!name || !email || !password) {
    return NextResponse.json({ error: "name, email and password are required" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }
  if (await findUserByEmail(email)) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const user = await createUser({ name, email, passwordHash: await hashPassword(password) });

  const token = await createSessionToken(user);
  await setSessionCookie(token);

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}
