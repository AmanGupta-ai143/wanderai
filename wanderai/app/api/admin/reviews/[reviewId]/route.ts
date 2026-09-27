import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth";
import { deleteReview } from "@/lib/server/repository";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  const { reviewId } = await params;
  const deleted = await deleteReview(reviewId);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
