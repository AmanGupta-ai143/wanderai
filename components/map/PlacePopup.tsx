"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, X, Navigation } from "lucide-react";
import { MapPlace, distanceKm } from "@/lib/map-data";

export default function PlacePopup({
  place,
  from,
  onClose,
  onGetDirections,
}: {
  place: MapPlace;
  from: { lat: number; lng: number } | null;
  onClose: () => void;
  onGetDirections: () => void;
}) {
  const km = from ? distanceKm(from, place) : null;

  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 md:left-5 md:translate-x-0 w-[calc(100%-2.5rem)] max-w-xs bg-paper rounded-2xl shadow-2xl overflow-hidden z-10">
      <button
        onClick={onClose}
        className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-ink/40 backdrop-blur grid place-items-center text-paper hover:bg-ink/60 z-10"
        aria-label="Close"
      >
        <X size={14} />
      </button>
      <div className="relative h-32">
        <Image src={place.image} alt={place.name} fill sizes="320px" className="object-cover" />
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg leading-tight">{place.name}</h3>
        <p className="text-xs text-muted mt-0.5">{place.subtitle}</p>
        <div className="flex items-center gap-3 mt-2 text-xs">
          <span className="flex items-center gap-1 text-ink/80">
            <Star size={11} className="fill-gold text-gold" strokeWidth={0} /> {place.rating}
          </span>
          {place.priceLabel && <span className="text-ink/60">{place.priceLabel}</span>}
          {km !== null && <span className="text-ink/60">{km.toFixed(1)} km away</span>}
        </div>

        <div className="flex gap-2 mt-4">
          {place.href && (
            <Link
              href={place.href}
              className="flex-1 text-center text-xs font-medium rounded-full border border-ink/20 py-2 hover:bg-sand transition-colors"
            >
              View Details
            </Link>
          )}
          <button
            onClick={onGetDirections}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium rounded-full bg-terracotta text-paper py-2 hover:bg-terracotta/90 transition-colors"
          >
            <Navigation size={12} /> Directions
          </button>
        </div>
      </div>
    </div>
  );
}
