"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart, Star, ArrowRight } from "lucide-react";
import { Destination } from "@/lib/types";
import { useAuth } from "@/lib/client/AuthProvider";

export default function DestinationCard({
  destination,
  size = "small",
}: {
  destination: Destination;
  size?: "large" | "small";
}) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const isLarge = size === "large";

  async function toggleSave(e: React.MouseEvent) {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }
    setSaving(true);
    try {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinationSlug: destination.slug }),
      });
      setSaved((s) => !s);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className={`group relative block overflow-hidden rounded-2xl bg-ink transition-transform duration-300 hover:-translate-y-1 ${
        isLarge ? "aspect-[16/10]" : "aspect-[3/4]"
      }`}
    >
      <Image
        src={isLarge ? destination.heroImage : destination.cardImage}
        alt={destination.name}
        fill
        sizes={isLarge ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 24vw, 50vw"}
        className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />

      <button
        onClick={toggleSave}
        disabled={saving}
        aria-label="Save destination"
        className="absolute top-4 right-4 grid place-items-center w-9 h-9 rounded-full bg-ink/30 backdrop-blur-sm hover:bg-ink/50 transition-colors"
      >
        <Heart
          size={17}
          className={saved ? "fill-terracotta text-terracotta" : "text-paper"}
          strokeWidth={2}
        />
      </button>

      <div className={`absolute inset-x-0 bottom-0 p-5 ${isLarge ? "md:p-8" : ""}`}>
        <div className="flex items-center gap-1.5 text-gold text-xs mb-1.5">
          <Star size={13} className="fill-gold" strokeWidth={0} />
          {destination.rating}
        </div>
        <h3 className={`font-display text-paper ${isLarge ? "text-3xl md:text-4xl" : "text-xl"}`}>
          {destination.name}
        </h3>
        <p className={`text-paper/75 mt-1 ${isLarge ? "text-base" : "text-sm"}`}>
          {destination.tagline}
        </p>
        <div className="mt-3 flex items-center gap-1.5 text-sm text-paper/90 opacity-0 group-hover:opacity-100 transition-opacity">
          Explore
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
