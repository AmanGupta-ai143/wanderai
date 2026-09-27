import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth";
import { getAttraction, listReviews, createReview } from "@/lib/server/repository";

type Params = { params: Promise<{ slug: string; attractionSlug: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { slug, attractionSlug } = await params;
  const reviews = await listReviews(slug, attractionSlug);
  return NextResponse.json({ reviews });
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in to leave a review" }, { status: 401 });
  }

  const { slug, attractionSlug } = await params;
  if (!(await getAttraction(slug, attractionSlug))) {
    return NextResponse.json({ error: "Attraction not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const rating = Number(body?.rating);
  const text = String(body?.text ?? "").trim();

  if (!rating || rating < 1 || rating > 5 || !text) {
    return NextResponse.json(
      { error: "rating (1-5) and text are required" },
      { status: 400 }
    );
  }

  const review = await createReview({
    userId: session.sub,
    destinationSlug: slug,
    attractionSlug,
    rating,
    text,
  });

  return NextResponse.json({ review }, { status: 201 });
}
