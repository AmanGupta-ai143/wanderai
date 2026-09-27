import { NextRequest, NextResponse } from "next/server";
import { generatePackingList } from "@/lib/server/packing";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const destinationSlug = body?.destinationSlug;
  const days = Number(body?.days) || 4;
  const activities = Array.isArray(body?.activities) ? body.activities : [];

  if (!destinationSlug) {
    return NextResponse.json({ error: "destinationSlug is required" }, { status: 400 });
  }

  const list = await generatePackingList(destinationSlug, days, activities);
  if (!list) return NextResponse.json({ error: "Destination not found" }, { status: 404 });

  return NextResponse.json({ categories: list });
}
