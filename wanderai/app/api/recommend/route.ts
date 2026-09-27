import { NextRequest, NextResponse } from "next/server";
import { recommendDestinations } from "@/lib/server/recommend";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const interests = Array.isArray(body?.interests) ? body.interests : [];
  const budget = Number(body?.budget) || 15000;
  const days = Number(body?.days) || 4;

  const results = await recommendDestinations({ interests, budget, days });
  return NextResponse.json({ results });
}
