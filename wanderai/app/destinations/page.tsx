"use client";

import { useEffect, useState } from "react";
import DestinationCard from "@/components/DestinationCard";
import { Destination } from "@/lib/types";

const CATEGORIES = [
  "History",
  "Beaches",
  "Mountains",
  "Food",
  "Culture",
  "Wildlife",
  "Adventure",
  "Shopping",
];

// Loosely maps homepage category labels to the tag vocabulary actually
// used on destinations, since they don't always match 1:1.
const CATEGORY_TAG_MAP: Record<string, string[]> = {
  History: ["heritage"],
  Beaches: ["beaches"],
  Mountains: ["mountains"],
  Food: ["cuisine"],
  Culture: ["culture"],
  Wildlife: ["wildlife", "nature"],
  Adventure: ["adventure"],
  Shopping: ["shopping"],
};

export default function ExploreDestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[] | null>(null);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/destinations")
      .then((r) => r.json())
      .then((d) => setDestinations(d.destinations ?? []));
  }, []);

  const filtered =
    !active || !destinations
      ? destinations
      : destinations.filter((d) => {
          const wanted = CATEGORY_TAG_MAP[active] ?? [active.toLowerCase()];
          const tags = d.tags.map((t) => t.toLowerCase());
          return wanted.some((w) => tags.includes(w));
        });

  return (
    <div className="pt-28 pb-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <p className="text-xs tracking-wide text-terracotta mb-3">EXPLORE</p>
        <h1 className="font-display text-4xl md:text-5xl mb-8">All destinations</h1>

        <div className="flex flex-wrap gap-2 mb-12">
          <button
            onClick={() => setActive(null)}
            className={`text-sm px-4 py-2 rounded-full transition-colors ${
              active === null ? "bg-ink text-paper" : "bg-sand text-ink/70 hover:bg-ink/10"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`text-sm px-4 py-2 rounded-full transition-colors ${
                active === c ? "bg-ink text-paper" : "bg-sand text-ink/70 hover:bg-ink/10"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {!destinations && <p className="text-muted">Loading…</p>}

        {destinations && filtered && filtered.length === 0 && (
          <p className="text-muted">No destinations match this category yet.</p>
        )}

        {filtered && filtered.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {filtered.map((d) => (
              <DestinationCard key={d.slug} destination={d} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
