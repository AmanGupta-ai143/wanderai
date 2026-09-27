import { NextRequest, NextResponse } from "next/server";
import { updateFestival, deleteFestival } from "@/lib/server/repository";
import { getSession } from "@/lib/server/auth";

type Params = { params: Promise<{ slug: string; festivalSlug: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  const { slug, festivalSlug } = await params;
  const patch = await req.json().catch(() => null);
  if (!patch) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  const updated = await updateFestival(slug, festivalSlug, patch);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ festival: updated });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  const { slug, festivalSlug } = await params;
  const deleted = await deleteFestival(slug, festivalSlug);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
