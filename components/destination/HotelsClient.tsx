"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import { Hotel } from "@/lib/types";

const TIERS = ["All", "Budget", "Mid-range", "Luxury"] as const;

export default function HotelsClient({
  destinationName,
  destinationSlug,
  hotels,
}: {
  destinationName: string;
  destinationSlug: string;
  hotels: Hotel[];
}) {
  const [tier, setTier] = useState<(typeof TIERS)[number]>("All");
  const filtered = tier === "All" ? hotels : hotels.filter((h) => h.tier === tier);

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-10 py-14 md:py-20">
      <p className="text-xs tracking-wide text-terracotta mb-3">STAY</p>
      <h1 className="font-display text-4xl md:text-5xl mb-4">Where to stay in {destinationName}</h1>
      <p className="text-muted max-w-xl leading-relaxed mb-8">
        From heritage havelis to five-star palaces.
      </p>

      <div className="flex gap-2 mb-10">
        {TIERS.map((t) => (
          <button
            key={t}
            onClick={() => setTier(t)}
            className={`text-sm px-4 py-2 rounded-full transition-colors ${
              tier === t ? "bg-ink text-paper" : "bg-sand text-ink/70 hover:bg-ink/10"
            }`}
          >
            {t}
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
        {filtered.map((h) => (
          <div key={h.slug} className="group">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src={h.image}
                alt={h.name}
                fill
                sizes="(min-width: 1024px) 30vw, 90vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute top-3 left-3 text-xs bg-paper/90 backdrop-blur px-2.5 py-1 rounded-full">
                {h.tier}
              </span>
            </div>
            <div className="mt-3.5 flex items-start justify-between">
              <div>
                <h3 className="font-display text-lg">{h.name}</h3>
                <p className="text-sm text-muted mt-0.5">
                  ₹{h.pricePerNight.toLocaleString("en-IN")} / night
                </p>
              </div>
              <span className="flex items-center gap-1 text-sm text-ink/80 shrink-0 mt-1">
                <Star size={13} className="fill-gold text-gold" strokeWidth={0} /> {h.rating}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-muted text-center py-16">No hotels match this filter yet.</p>
      )}
    </div>
  );
}
