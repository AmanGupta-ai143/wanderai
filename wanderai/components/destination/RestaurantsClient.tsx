"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import { Restaurant } from "@/lib/types";

export default function RestaurantsClient({
  destinationName,
  destinationSlug,
  restaurants,
}: {
  destinationName: string;
  destinationSlug: string;
  restaurants: Restaurant[];
}) {
  const [cuisine, setCuisine] = useState("All");
  const cuisines = ["All", ...Array.from(new Set(restaurants.map((r) => r.cuisine)))];
  const filtered = cuisine === "All" ? restaurants : restaurants.filter((r) => r.cuisine === cuisine);

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-10 py-14 md:py-20">
      <p className="text-xs tracking-wide text-terracotta mb-3">EAT</p>
      <h1 className="font-display text-4xl md:text-5xl mb-4">
        Where should you eat in {destinationName}?
      </h1>
      <p className="text-muted max-w-xl leading-relaxed mb-8">
        Local favorites, from street stalls to rooftop dining.
      </p>

      <div className="flex flex-wrap gap-2 mb-10">
        {cuisines.map((c) => (
          <button
            key={c}
            onClick={() => setCuisine(c)}
            className={`text-sm px-4 py-2 rounded-full transition-colors ${
              cuisine === c ? "bg-ink text-paper" : "bg-sand text-ink/70 hover:bg-ink/10"
            }`}
          >
            {c}
          </button>
        ))}
        <Link
          href={`/map?destination=${destinationSlug}`}
          className="ml-auto text-sm px-4 py-2 rounded-full border border-ink/15 hover:bg-sand transition-colors flex items-center gap-1.5"
        >
          <MapPin size={13} /> View on map
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((r) => (
          <div key={r.slug} className="group">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src={r.image}
                alt={r.name}
                fill
                sizes="(min-width: 1024px) 30vw, 90vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="mt-3.5 flex items-start justify-between">
              <div>
                <h3 className="font-display text-lg">{r.name}</h3>
                <p className="text-sm text-muted mt-0.5">
                  {r.cuisine} · {"₹".repeat(r.priceLevel)}
                </p>
              </div>
              <span className="flex items-center gap-1 text-sm text-ink/80 shrink-0 mt-1">
                <Star size={13} className="fill-gold text-gold" strokeWidth={0} /> {r.rating}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
