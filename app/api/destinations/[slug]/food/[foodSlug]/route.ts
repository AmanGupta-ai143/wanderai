import { NextRequest, NextResponse } from "next/server";
import { updateFood, deleteFood } from "@/lib/server/repository";
import { getSession } from "@/lib/server/auth";

type Params = { params: Promise<{ slug: string; foodSlug: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  const { slug, foodSlug } = await params;
  const patch = await req.json().catch(() => null);
  if (!patch) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  const updated = await updateFood(slug, foodSlug, patch);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ food: updated });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  const { slug, foodSlug } = await params;
  const deleted = await deleteFood(slug, foodSlug);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
