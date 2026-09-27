import { NextRequest, NextResponse } from "next/server";
import { listDestinations } from "@/lib/server/repository";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? undefined;
  const results = await listDestinations(q);
  return NextResponse.json({ results, count: results.length });
}
