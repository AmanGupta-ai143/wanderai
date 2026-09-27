import { NextRequest, NextResponse } from "next/server";
import { getSession, hashPassword, verifyPassword } from "@/lib/server/auth";
import { findUserById, findUserByEmail, updateUserProfile } from "@/lib/server/repository";

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const user = await findUserById(session.sub);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const { name, email, currentPassword, newPassword } = body ?? {};

  const patch: { name?: string; email?: string; passwordHash?: string } = {};

  if (name) patch.name = name;
  if (email) {
    const existing = await findUserByEmail(email);
    if (existing && existing.id !== user.id) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }
    patch.email = email;
  }

  if (newPassword) {
    if (!currentPassword || !(await verifyPassword(currentPassword, user.passwordHash))) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
    }
    patch.passwordHash = await hashPassword(newPassword);
  }

  const updated = await updateUserProfile(user.id, patch);

  return NextResponse.json({
    user: { id: updated!.id, name: updated!.name, email: updated!.email, role: updated!.role },
  });
}
