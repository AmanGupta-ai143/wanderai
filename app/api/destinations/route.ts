import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth";
import { listDestinations, createDestination } from "@/lib/server/repository";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? undefined;
  const results = await listDestinations(q);
  return NextResponse.json({ destinations: results, count: results.length });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.slug || !body?.name) {
    return NextResponse.json({ error: "slug and name are required" }, { status: 400 });
  }

  try {
    const created = await createDestination(body);
    return NextResponse.json({ destination: created }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 409 });
  }
}
