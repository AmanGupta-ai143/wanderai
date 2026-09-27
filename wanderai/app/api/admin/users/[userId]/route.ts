import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth";
import { setUserRole, deleteUser, listUsers } from "@/lib/server/repository";

type Params = { params: Promise<{ userId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  const { userId } = await params;
  const body = await req.json().catch(() => null);
  const role = body?.role;
  if (role !== "USER" && role !== "ADMIN") {
    return NextResponse.json({ error: "role must be USER or ADMIN" }, { status: 400 });
  }

  if (userId === session.sub && role === "USER") {
    return NextResponse.json({ error: "You can't remove your own admin access" }, { status: 400 });
  }

  const updated = await setUserRole(userId, role);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ user: updated });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  const { userId } = await params;

  if (userId === session.sub) {
    return NextResponse.json({ error: "You can't delete your own account" }, { status: 400 });
  }

  const allUsers = await listUsers();
  const target = allUsers.find((u) => u.id === userId);
  const remainingAdmins = allUsers.filter((u) => u.role === "ADMIN" && u.id !== userId);
  if (target?.role === "ADMIN" && remainingAdmins.length === 0) {
    return NextResponse.json({ error: "Can't delete the last remaining admin" }, { status: 400 });
  }

  const deleted = await deleteUser(userId);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
