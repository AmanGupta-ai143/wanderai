import { listDestinations } from "./repository";

// NOTE: rule-based scoring, same spirit as the itinerary generator — a
// stand-in for a future embeddings/LLM-backed recommender (Phase 6). The
// request/response shape below is what that version would return too.

export type RecommendInput = {
  interests: string[];
  budget: number; // total trip budget in ₹
  days: number;
};

export type RecommendResult = {
  slug: string;
  name: string;
  tagline: string;
  cardImage: string;
  matchPercent: number;
  matchedTags: string[];
};

const BUDGET_LEVEL_MAX: Record<string, number> = { "₹": 12000, "₹₹": 30000, "₹₹₹": 100000 };

export async function recommendDestinations(input: RecommendInput): Promise<RecommendResult[]> {
  const interests = input.interests.map((i) => i.toLowerCase());
  const destinations = await listDestinations();

  const scored = destinations.map((d) => {
    const tags = d.tags.map((t) => t.toLowerCase());
    const matchedTags = d.tags.filter((t) => interests.includes(t.toLowerCase()));

    const interestScore =
      interests.length > 0 ? matchedTags.length / interests.length : 0.5;

    const budgetCap = BUDGET_LEVEL_MAX[d.quickFacts.budget] ?? 30000;
    const budgetScore = input.budget >= budgetCap * 0.5 ? 1 : input.budget / (budgetCap * 0.5);

    // crude stay-length parser, e.g. "3–4 Days" -> average 3.5
    const stayMatch = d.quickFacts.stay.match(/(\d+)\D+(\d+)?/);
    const stayAvg = stayMatch
      ? (Number(stayMatch[1]) + Number(stayMatch[2] ?? stayMatch[1])) / 2
      : 4;
    const durationScore = 1 - Math.min(1, Math.abs(input.days - stayAvg) / 6);

    const weighted = interestScore * 0.65 + budgetScore * 0.2 + durationScore * 0.15;

    return {
      slug: d.slug,
      name: d.name,
      tagline: d.tagline,
      cardImage: d.cardImage,
      matchPercent: Math.round(Math.min(0.99, Math.max(0.35, weighted)) * 100),
      matchedTags,
      _tags: tags,
    };
  });

  return scored
    .sort((a, b) => b.matchPercent - a.matchPercent)
    .map(({ slug, name, tagline, cardImage, matchPercent, matchedTags }) => ({
      slug,
      name,
      tagline,
      cardImage,
      matchPercent,
      matchedTags,
    }));
}
