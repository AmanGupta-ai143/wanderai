// Thin wrapper around Google's Gemini REST API (generativelanguage.googleapis.com).
//
// IMPORTANT HONESTY NOTE: this was written from Gemini's documented REST
// format, not verified against a live call. The sandbox this was built in
// only allowlists api.anthropic.com for outbound network — Gemini's domain
// isn't reachable here, so unlike the earlier Anthropic integration, I
// could not confirm even that the request reaches Google's servers. Test
// this for real before relying on it: run `npm run dev` with a real
// GEMINI_API_KEY set and watch the server console — both call sites log a
// clear error and fall back to rule-based logic if anything's wrong, so a
// bad request will be visible, not silent.
//
// Get a key at https://aistudio.google.com/apikey — Gemini's free tier is
// generally more generous than most paid LLM APIs, which is why this
// project uses it instead of a paid-only provider. Check Google's current
// pricing/rate-limit page, since terms change.

const MODEL = "gemini-2.0-flash";

export async function callGemini(systemInstruction: string, userMessage: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      generationConfig: { maxOutputTokens: 1024 },
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => "");
    throw new Error(`Gemini API returned ${response.status}: ${errBody.slice(0, 300)}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("No text content in Gemini response");

  return text;
}
