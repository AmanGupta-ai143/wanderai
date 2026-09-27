"use client";

import { Landmark, Hotel, UtensilsCrossed } from "lucide-react";
import { PlaceCategory } from "@/lib/map-data";

const CATEGORIES: { key: PlaceCategory; label: string; icon: typeof Landmark }[] = [
  { key: "attraction", label: "Attractions", icon: Landmark },
  { key: "hotel", label: "Hotels", icon: Hotel },
  { key: "restaurant", label: "Restaurants", icon: UtensilsCrossed },
];

const RATING_OPTIONS = [0, 4, 4.5];

export type MapFilters = {
  categories: Set<PlaceCategory>;
  minRating: number;
};

export default function FilterPanel({
  filters,
  onChange,
}: {
  filters: MapFilters;
  onChange: (f: MapFilters) => void;
}) {
  function toggleCategory(key: PlaceCategory) {
    const next = new Set(filters.categories);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange({ ...filters, categories: next });
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <p className="text-xs tracking-wide text-muted mb-4">EXPLORE</p>

      <div className="space-y-1 mb-8">
        {CATEGORIES.map(({ key, label, icon: Icon }) => {
          const active = filters.categories.has(key);
          return (
            <button
              key={key}
              onClick={() => toggleCategory(key)}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                active ? "bg-sand text-ink" : "text-muted hover:bg-sand/60"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-[5px] border flex items-center justify-center ${
                  active ? "bg-terracotta border-terracotta" : "border-ink/25"
                }`}
              >
                {active && <span className="w-1.5 h-1.5 bg-paper rounded-[2px]" />}
              </span>
              <Icon size={16} strokeWidth={1.75} />
              {label}
            </button>
          );
        })}
      </div>

      <p className="text-xs tracking-wide text-muted mb-3">MINIMUM RATING</p>
      <div className="flex gap-2 mb-8">
        {RATING_OPTIONS.map((r) => (
          <button
            key={r}
            onClick={() => onChange({ ...filters, minRating: r })}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
              filters.minRating === r
                ? "bg-ink text-paper"
                : "bg-sand text-ink/70 hover:bg-ink/10"
            }`}
          >
            {r === 0 ? "All" : `${r}+ ⭐`}
          </button>
        ))}
      </div>
    </div>
  );
}
