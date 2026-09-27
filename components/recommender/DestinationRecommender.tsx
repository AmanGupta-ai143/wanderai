"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

const INTERESTS = [
  "Heritage",
  "Cuisine",
  "Culture",
  "Beaches",
  "Nightlife",
  "Mountains",
  "Adventure",
  "Nature",
  "Spiritual",
];

type Result = {
  slug: string;
  name: string;
  tagline: string;
  cardImage: string;
  matchPercent: number;
  matchedTags: string[];
};

export default function DestinationRecommender() {
  const [interests, setInterests] = useState<string[]>(["Heritage", "Culture"]);
  const [budget, setBudget] = useState(15000);
  const [days, setDays] = useState(4);
  const [results, setResults] = useState<Result[] | null>(null);
  const [loading, setLoading] = useState(false);

  function toggle(i: string) {
    setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  }

  async function find() {
    setLoading(true);
    const res = await fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interests, budget, days }),
    });
    const data = await res.json();
    setResults(data.results);
    setLoading(false);
  }

  if (results) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <p className="text-xs tracking-wide text-terracotta">YOUR MATCHES</p>
          <button onClick={() => setResults(null)} className="text-xs text-muted hover:text-ink">
            Try again
          </button>
        </div>

        <div className="space-y-5">
          {results.map((r, i) => (
            <Link
              key={r.slug}
              href={`/destinations/${r.slug}`}
              className="group flex items-center gap-5 rounded-2xl border border-ink/10 bg-white p-4 hover:border-terracotta/40 hover:shadow-md transition-all"
            >
              <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                <Image src={r.cardImage} alt={r.name} fill sizes="80px" className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-display text-xl">
                    {i + 1}. {r.name}
                  </h2>
                  <span className="font-display text-lg text-terracotta">{r.matchPercent}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-sand overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full bg-terracotta transition-all duration-500"
                    style={{ width: `${r.matchPercent}%` }}
                  />
                </div>
                {r.matchedTags.length > 0 && (
                  <p className="text-xs text-muted">Matches: {r.matchedTags.join(", ")}</p>
                )}
              </div>
              <ArrowRight
                size={16}
                className="text-ink/30 group-hover:text-terracotta group-hover:translate-x-1 transition-all shrink-0"
              />
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-10">
        <Sparkles className="mx-auto text-gold mb-4" size={26} strokeWidth={1.5} />
        <h1 className="font-display text-3xl md:text-4xl mb-3">Find your next escape</h1>
        <p className="text-muted">Tell us what you love — we&apos;ll find where to go.</p>
      </div>

      <div className="rounded-3xl bg-white border border-ink/8 shadow-sm p-7 md:p-8 space-y-6">
        <div>
          <label className="block text-sm text-muted mb-3">What kind of journey?</label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((i) => (
              <button
                key={i}
                onClick={() => toggle(i)}
                className={`text-sm px-4 py-2 rounded-full transition-colors ${
                  interests.includes(i) ? "bg-terracotta text-paper" : "bg-sand text-ink/70 hover:bg-ink/10"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-muted mb-2">Budget (₹)</label>
            <input
              type="number"
              min={1000}
              step={1000}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full border border-ink/15 rounded-xl px-4 py-3 text-sm bg-paper"
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-2">Duration (days)</label>
            <input
              type="number"
              min={1}
              max={14}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full border border-ink/15 rounded-xl px-4 py-3 text-sm bg-paper"
            />
          </div>
        </div>

        <button
          onClick={find}
          disabled={loading || interests.length === 0}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-terracotta text-paper text-sm font-medium py-3.5 hover:bg-terracotta/90 transition-colors disabled:opacity-60"
        >
          <Sparkles size={15} /> {loading ? "Matching…" : "Find My Destination"}
        </button>
      </div>
    </div>
  );
}
