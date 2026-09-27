import { Destination } from "@/lib/types";

// NOTE: keyword/pattern matching over the destination's own data, not a
// real LLM. This is Phase 5's placeholder — a real version would call
// /api/ai/chat with an LLM (e.g. the Anthropic API) and the destination's
// content as context/RAG source. Kept here so swapping it out later only
// means replacing this one function.

export function answerQuestion(question: string, destination: Destination | null): string {
  const q = question.toLowerCase();

  if (!destination) {
    return "Pick a destination first (browse from the homepage) and I can answer questions about it.";
  }

  if (/\b(pack|packing|bring|wear)\b/.test(q)) {
    return `For ${destination.name} (currently ${destination.weather.tempC}°C), check the Smart Packing List — it builds a checklist based on the climate and your trip length.`;
  }

  if (/\b(budget|cost|afford|expensive|cheap|price)\b/.test(q)) {
    return `Use the Budget Calculator for a real estimate — for ${destination.name}, typical costs run ${destination.quickFacts.budget} per day. I can also generate a full itinerary with day-by-day costs via the AI Trip Planner.`;
  }

  if (/\b(crowd|busy|quiet|less crowded)\b/.test(q)) {
    return `Early morning (before 9am) is generally quieter at ${destination.name}'s major sites. Check the Best Time to Visit page — some months see far fewer tourists than others.`;
  }

  if (/\b(far|distance|km|how long|route|get to|reach)\b/.test(q)) {
    if (destination.attractions.length >= 2) {
      const [a, b] = destination.attractions;
      return `Distances vary between places — use the Route Planner on the Map page to get exact distance and travel time between any two spots, like ${a.name} and ${b.name}.`;
    }
    return "Use the Route Planner on the Map page for exact distances and travel times.";
  }

  if (/\b(eat|food|cuisine|dish|restaurant|hungry)\b/.test(q)) {
    const top = destination.food.slice(0, 3).map((f) => f.name);
    return top.length
      ? `In ${destination.name}, don't miss: ${top.join(", ")}. Full details — including where to try each — are on the Food page.`
      : `Check the Food page for what to eat in ${destination.name}.`;
  }

  if (/\b(day|itinerary|plan|schedule)\b/.test(q)) {
    return `The AI Trip Planner can build you a full day-by-day itinerary for ${destination.name} based on your interests and budget — want me to take you there?`;
  }

  if (/\b(visit|see|place|attraction|do|things to do)\b/.test(q)) {
    const top = [...destination.attractions]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3)
      .map((a) => a.name);
    return top.length
      ? `Top-rated in ${destination.name}: ${top.join(", ")}. See the full list on the destination page.`
      : `Check the destination page for places to visit in ${destination.name}.`;
  }

  if (/\b(weather|hot|cold|rain|temperature)\b/.test(q)) {
    return `${destination.name} is currently ${destination.weather.tempC}°C, ${destination.weather.condition.toLowerCase()}. Best time to visit overall: ${destination.bestTime}.`;
  }

  if (/\b(culture|festival|tradition|dance|art)\b/.test(q)) {
    const top = destination.culture.slice(0, 2).map((c) => c.title);
    return top.length
      ? `${destination.name}'s culture is rich — start with ${top.join(" and ")}. Full details on the Culture page.`
      : `Check the Culture page for ${destination.name}'s traditions and festivals.`;
  }

  return `I can help with places to visit, food, packing, budget, culture, or getting around ${destination.name} — try asking about one of those, or browse the destination page directly.`;
}

export const SUGGESTED_QUESTIONS = [
  "What should I visit?",
  "What should I eat?",
  "What should I pack?",
  "Is this trip budget-friendly?",
];
