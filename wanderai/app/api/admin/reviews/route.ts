import { NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth";
import { listAllReviews } from "@/lib/server/repository";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  return NextResponse.json({ reviews: await listAllReviews() });
}
