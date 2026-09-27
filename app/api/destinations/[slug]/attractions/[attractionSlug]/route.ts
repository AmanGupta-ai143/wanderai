import { NextRequest, NextResponse } from "next/server";
import { getAttraction, updateAttraction, deleteAttraction } from "@/lib/server/repository";
import { getSession } from "@/lib/server/auth";

type Params = { params: Promise<{ slug: string; attractionSlug: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { slug, attractionSlug } = await params;
  const result = await getAttraction(slug, attractionSlug);
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(result);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  const { slug, attractionSlug } = await params;
  const patch = await req.json().catch(() => null);
  if (!patch) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const updated = await updateAttraction(slug, attractionSlug, patch);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ attraction: updated });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  const { slug, attractionSlug } = await params;
  const deleted = await deleteAttraction(slug, attractionSlug);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
