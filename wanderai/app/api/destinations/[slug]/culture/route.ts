import { NextRequest, NextResponse } from "next/server";
import { getDestinationBySlug, createCultureItem } from "@/lib/server/repository";
import { getSession } from "@/lib/server/auth";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const dest = await getDestinationBySlug(slug);
  if (!dest) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ culture: dest.culture });
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  const { slug } = await params;
  const body = await req.json().catch(() => null);
  if (!body?.slug || !body?.title) {
    return NextResponse.json({ error: "slug and title are required" }, { status: 400 });
  }
  try {
    const created = await createCultureItem(slug, body);
    return NextResponse.json({ culture: created }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 409 });
  }
}
