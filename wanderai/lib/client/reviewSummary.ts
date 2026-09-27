// NOTE: simple keyword-frequency extraction over review text, not a real
// LLM sentiment summary. Splits words against small positive/negative
// lexicons and surfaces the most repeated ones. A real version would send
// review text to an LLM (Phase 5) and ask for a proper summary.

const POSITIVE_WORDS = [
  "beautiful", "amazing", "stunning", "incredible", "gorgeous", "peaceful",
  "history", "historic", "architecture", "photography", "views", "view",
  "friendly", "clean", "worth", "sunrise", "sunset", "impressive", "magical",
];
const NEGATIVE_WORDS = [
  "crowded", "busy", "expensive", "overpriced", "hot", "noisy", "long",
  "queue", "queues", "touristy", "dirty", "hassle", "scam",
];

function extractMatches(texts: string[], lexicon: string[]): { word: string; count: number }[] {
  const counts = new Map<string, number>();
  const joined = texts.join(" ").toLowerCase();
  for (const word of lexicon) {
    const re = new RegExp(`\\b${word}\\b`, "g");
    const matches = joined.match(re);
    if (matches && matches.length > 0) counts.set(word, matches.length);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([word, count]) => ({ word, count }));
}

export function summarizeReviews(reviewTexts: string[]) {
  if (reviewTexts.length < 3) return null; // not enough signal to summarize honestly
  const loves = extractMatches(reviewTexts, POSITIVE_WORDS).slice(0, 4);
  const concerns = extractMatches(reviewTexts, NEGATIVE_WORDS).slice(0, 3);
  if (loves.length === 0 && concerns.length === 0) return null;
  return { loves: loves.map((l) => l.word), concerns: concerns.map((c) => c.word) };
}
