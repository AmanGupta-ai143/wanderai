import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth";
import { getDestinationBySlug, createItinerary, listItineraries } from "@/lib/server/repository";
import { callGemini } from "@/lib/server/gemini";

type ItineraryItem = {
  day: number;
  time: string;
  label: string;
  attractionSlug?: string;
  estimatedCost: number;
};

// NOTE: This generates a deterministic, rule-based itinerary from the
// destination's attraction list. It's a stand-in for Phase 5's real AI trip
// planner — same request/response shape, so the frontend won't need to
// change when the LLM-backed version replaces this. See buildItineraryWithLLM
// below for the real version, gated behind ANTHROPIC_API_KEY.
async function buildItinerary(destSlug: string, days: number): Promise<ItineraryItem[] | null> {
  const dest = await getDestinationBySlug(destSlug);
  if (!dest) return null;

  const slots = ["09:00", "12:30", "14:00", "16:30", "19:00"];
  const items: ItineraryItem[] = [];

  let attractionIndex = 0;
  for (let day = 1; day <= days; day++) {
    slots.forEach((time, i) => {
      if (i === 1) {
        items.push({ day, time, label: "Local lunch", estimatedCost: 400 });
        return;
      }
      if (i === 4) {
        items.push({ day, time, label: "Dinner", estimatedCost: 600 });
        return;
      }
      const attraction = dest.attractions[attractionIndex % dest.attractions.length];
      attractionIndex++;
      items.push({
        day,
        time,
        label: attraction.name,
        attractionSlug: attraction.slug,
        estimatedCost: 300,
      });
    });
  }
  return items;
}

// Validates the LLM's JSON response actually matches ItineraryItem[] and
// only references real attraction slugs — an LLM can hallucinate a
// plausible-looking but wrong shape, and we'd rather fall back cleanly
// than store garbage.
function isValidItinerary(value: unknown, validSlugs: Set<string>): value is ItineraryItem[] {
  if (!Array.isArray(value) || value.length === 0) return false;
  return value.every(
    (item) =>
      item &&
      typeof item.day === "number" &&
      typeof item.time === "string" &&
      typeof item.label === "string" &&
      typeof item.estimatedCost === "number" &&
      (item.attractionSlug === undefined || validSlugs.has(item.attractionSlug))
  );
}

// Real LLM itinerary generation via Google Gemini, gated behind
// GEMINI_API_KEY. Untested against a live Gemini call in this environment
// — see lib/server/gemini.ts for why. JSON parsing/validation and the
// fallback-to-rule-based path are still solid regardless of which LLM is
// behind callGemini(), since they never assume the response is well-formed.
async function buildItineraryWithLLM(
  destSlug: string,
  days: number,
  interests: string[],
  travelStyle: string
): Promise<ItineraryItem[] | null> {
  if (!process.env.GEMINI_API_KEY) return null;

  const dest = await getDestinationBySlug(destSlug);
  if (!dest) return null;

  const validSlugs = new Set(dest.attractions.map((a) => a.slug));

  try {
    const systemInstruction = `You generate day-by-day travel itineraries for the WanderAI app. Respond with ONLY a JSON array, no markdown fences, no preamble, no commentary.

Each array item must have exactly these fields:
- "day": integer, 1 to ${days}
- "time": string like "09:00"
- "label": string, a short activity name
- "attractionSlug": OPTIONAL string — if this item visits a real attraction, it MUST be exactly one of: ${[...validSlugs].join(", ")}. Omit this field for meals or free time.
- "estimatedCost": integer, in rupees

Build a realistic ${days}-day itinerary for ${dest.name} with 4-5 items per day (mix attraction visits, lunch, dinner), matching these interests: ${interests.join(", ") || "general sightseeing"}, at a "${travelStyle}" pace.`;

    const text = await callGemini(systemInstruction, `Plan my ${days}-day trip to ${dest.name}.`);
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (!isValidItinerary(parsed, validSlugs)) throw new Error("LLM response failed shape validation");
    return parsed;
  } catch (err) {
    console.error("AI trip planner fell back to rule-based generation:", err);
    return null;
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  return NextResponse.json({ itineraries: await listItineraries(session.sub) });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const { destinationSlug, days, budget, travelStyle, interests } = body ?? {};

  if (!destinationSlug || !days) {
    return NextResponse.json({ error: "destinationSlug and days are required" }, { status: 400 });
  }

  const items =
    (await buildItineraryWithLLM(destinationSlug, Number(days), interests ?? [], travelStyle ?? "Balanced")) ??
    (await buildItinerary(destinationSlug, Number(days)));
  if (!items) return NextResponse.json({ error: "Destination not found" }, { status: 404 });

  const itinerary = await createItinerary({
    userId: session.sub,
    destinationSlug,
    title: `${destinationSlug} trip`,
    days: Number(days),
    budget: Number(budget) || 0,
    travelStyle: travelStyle ?? "Balanced",
    interests: interests ?? [],
    items,
  });

  return NextResponse.json({ itinerary }, { status: 201 });
}
