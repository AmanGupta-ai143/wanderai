"use client";

import { useState } from "react";
import { MonthRating } from "@/lib/types";

export default function BestTimeClient({
  destinationName,
  months,
}: {
  destinationName: string;
  months: MonthRating[];
}) {
  const [active, setActive] = useState(0);

  return (
    <div className="mx-auto max-w-3xl px-6 lg:px-10 py-14 md:py-20">
      <p className="text-xs tracking-wide text-terracotta mb-3">BEST TIME TO VISIT</p>
      <h1 className="font-display text-4xl md:text-5xl mb-10">When to visit {destinationName}</h1>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mb-8">
        {months.map((m, i) => (
          <button
            key={m.month}
            onClick={() => setActive(i)}
            className={`rounded-xl py-4 text-center transition-colors ${
              active === i ? "bg-ink text-paper" : "bg-white border border-ink/10 hover:border-terracotta/40"
            }`}
          >
            <p className="text-sm font-medium">{m.month}</p>
            <p className="mt-1.5 text-sm">{m.score === 2 ? "⭐" : m.score === 1 ? "○" : "·"}</p>
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-sand/60 p-6">
        <p className="font-display text-2xl mb-2">{months[active].month}</p>
        <p className="text-sm text-muted mb-1">
          {months[active].score === 2
            ? "Best time to visit"
            : months[active].score === 1
            ? "Good, with some tradeoffs"
            : "Not recommended"}
        </p>
        <p className="text-ink/80">{months[active].note}</p>
      </div>

      <p className="text-xs text-muted mt-6">⭐ Best · ○ Good · · Avoid</p>
    </div>
  );
}
