import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth";
import {
  getDestinationBySlug,
  updateDestination,
  deleteDestination,
} from "@/lib/server/repository";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ destination });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  const { slug } = await params;
  const patch = await req.json().catch(() => null);
  if (!patch) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const updated = await updateDestination(slug, patch);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ destination: updated });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  const { slug } = await params;
  const deleted = await deleteDestination(slug);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
