import { NextRequest, NextResponse } from "next/server";
import { getDestinationBySlug, addGalleryImage } from "@/lib/server/repository";
import { getSession } from "@/lib/server/auth";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const dest = await getDestinationBySlug(slug);
  if (!dest) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ gallery: dest.gallery });
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  const { slug } = await params;
  const body = await req.json().catch(() => null);
  if (!body?.image || !body?.category || !body?.caption) {
    return NextResponse.json({ error: "image, category and caption are required" }, { status: 400 });
  }
  try {
    const created = await addGalleryImage(slug, body);
    return NextResponse.json({ image: created }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 409 });
  }
}
