import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth";
import { listFavorites, toggleFavorite } from "@/lib/server/repository";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  return NextResponse.json({ favorites: await listFavorites(session.sub) });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const { destinationSlug, attractionSlug } = body ?? {};
  if (!destinationSlug && !attractionSlug) {
    return NextResponse.json(
      { error: "destinationSlug or attractionSlug is required" },
      { status: 400 }
    );
  }

  const result = await toggleFavorite(session.sub, { destinationSlug, attractionSlug });
  return NextResponse.json(result);
}
