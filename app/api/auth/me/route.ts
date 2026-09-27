import { NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth";
import { findUserById } from "@/lib/server/repository";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });

  const user = await findUserById(session.sub);
  if (!user) return NextResponse.json({ user: null });

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}
