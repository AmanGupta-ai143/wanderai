import { NextRequest, NextResponse } from "next/server";
import { getDestinationBySlug } from "@/lib/server/repository";
import { answerQuestion } from "@/lib/client/chatAssistant";
import { callGemini } from "@/lib/server/gemini";

// Real LLM integration via Google Gemini, gated behind GEMINI_API_KEY.
// Falls back to the rule-based matcher if no key is configured, or if the
// API call fails for any reason — the chat widget should never go silent
// just because a key isn't set up yet.
//
// NOTE: untested against a live Gemini call in this environment — see
// lib/server/gemini.ts for why, and what to check first.

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const question = String(body?.question ?? "").trim();
  const destinationSlug = body?.destinationSlug as string | undefined;

  if (!question) {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }

  const destination = destinationSlug ? (await getDestinationBySlug(destinationSlug)) ?? null : null;

  if (process.env.GEMINI_API_KEY) {
    try {
      const context = destination
        ? `You are a helpful, concise travel assistant for the WanderAI app, currently answering questions about ${destination.name}, ${destination.region}, ${destination.country}.

Known facts about ${destination.name} (only use these — don't invent specifics not listed here):
- Tagline: ${destination.tagline}
- Best time to visit: ${destination.bestTime}
- Current weather: ${destination.weather.tempC}°C, ${destination.weather.condition}
- Top attractions: ${destination.attractions.map((a) => `${a.name} (${a.category}, rated ${a.rating})`).join("; ") || "none listed"}
- Signature foods: ${destination.food.map((f) => f.name).join(", ") || "none listed"}
- Culture highlights: ${destination.culture.map((c) => c.title).join(", ") || "none listed"}

Answer in 2-3 short sentences, warm and specific. If asked something this data can't answer, say so honestly and suggest which page of the app (Map, Budget Calculator, Trip Planner, Packing List) would help instead.`
        : `You are a helpful, concise travel assistant for the WanderAI app. No specific destination is currently selected — if the question needs destination-specific facts, ask the person to browse to a destination first. Answer in 2-3 short sentences.`;

      const text = await callGemini(context, question);
      return NextResponse.json({ answer: text, source: "llm" });
    } catch (err) {
      console.error("AI chat fell back to rule-based matching:", err);
      // fall through to rule-based response below
    }
  }

  const answer = answerQuestion(question, destination);
  return NextResponse.json({ answer, source: "rule-based" });
}
