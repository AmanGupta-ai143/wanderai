"use client";

import { useState } from "react";
import AttractionCard from "@/components/AttractionCard";
import { Attraction } from "@/lib/types";

export default function AttractionsGrid({
  attractions,
  destSlug,
}: {
  attractions: Attraction[];
  destSlug: string;
}) {
  const [active, setActive] = useState("All");
  const categories = ["All", ...Array.from(new Set(attractions.map((a) => a.category)))];
  const filtered = active === "All" ? attractions : attractions.filter((a) => a.category === active);

  return (
    <div>
      <div className="rail flex gap-2 overflow-x-auto pb-2 mb-8">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`shrink-0 text-sm px-4 py-2 rounded-full transition-colors ${
              active === c ? "bg-ink text-paper" : "bg-sand text-ink/70 hover:bg-ink/10"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
        {filtered.map((a) => (
          <AttractionCard key={a.slug} attraction={a} destSlug={destSlug} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-muted text-center py-10">No places in this category yet.</p>
      )}
    </div>
  );
}
