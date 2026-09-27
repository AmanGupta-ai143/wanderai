import { NextRequest, NextResponse } from "next/server";
import { updateHotel, deleteHotel } from "@/lib/server/repository";
import { getSession } from "@/lib/server/auth";

type Params = { params: Promise<{ slug: string; hotelSlug: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  const { slug, hotelSlug } = await params;
  const patch = await req.json().catch(() => null);
  if (!patch) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  const updated = await updateHotel(slug, hotelSlug, patch);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ hotel: updated });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  const { slug, hotelSlug } = await params;
  const deleted = await deleteHotel(slug, hotelSlug);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
