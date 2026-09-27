"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, X } from "lucide-react";
import { useAuth } from "@/lib/client/AuthProvider";
import { Destination } from "@/lib/types";

type Favorite = {
  id: string;
  destinationSlug?: string;
  attractionSlug?: string;
};

export default function WishlistPage() {
  const { user, loading } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[] | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);

  useEffect(() => {
    fetch("/api/destinations")
      .then((r) => r.json())
      .then((d) => setDestinations(d.destinations ?? []));
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((d) => setFavorites(d.favorites ?? []));
  }, [user]);

  function findDestination(slug?: string) {
    return slug ? destinations.find((d) => d.slug === slug) : undefined;
  }

  function findAttraction(destSlug?: string, attractionSlug?: string) {
    const dest = findDestination(destSlug);
    const attraction = dest?.attractions.find((a) => a.slug === attractionSlug);
    return dest && attraction ? { dest, attraction } : undefined;
  }

  async function remove(fav: Favorite) {
    await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        destinationSlug: fav.destinationSlug,
        attractionSlug: fav.attractionSlug,
      }),
    });
    setFavorites((prev) => prev?.filter((f) => f.id !== fav.id) ?? null);
  }

  if (loading) return <div className="pt-32 text-center text-muted">Loading…</div>;

  if (!user) {
    return (
      <div className="pt-32 pb-24 text-center px-6">
        <Heart size={26} className="mx-auto text-muted mb-4" strokeWidth={1.5} />
        <h1 className="font-display text-3xl mb-3">Sign in to see your wishlist</h1>
        <p className="text-muted mb-6">Save destinations and places as you explore.</p>
        <Link
          href="/login"
          className="inline-block rounded-full bg-terracotta text-paper text-sm font-medium px-6 py-3 hover:bg-terracotta/90 transition-colors"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const destinationFavs = (favorites ?? []).filter((f) => f.destinationSlug && !f.attractionSlug);
  const attractionFavs = (favorites ?? []).filter((f) => f.attractionSlug);

  return (
    <div className="pt-24 pb-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        <p className="text-xs tracking-wide text-terracotta mb-3">MY WISHLIST</p>
        <h1 className="font-display text-4xl md:text-5xl mb-12">Saved places</h1>

        {favorites && favorites.length === 0 && (
          <p className="text-muted">
            Nothing saved yet — tap the heart icon on any destination or attraction.
          </p>
        )}

        {destinationFavs.length > 0 && (
          <section className="mb-14">
            <h2 className="font-display text-2xl mb-5">Destinations</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
              {destinationFavs.map((f) => {
                const dest = findDestination(f.destinationSlug);
                if (!dest) return null;
                return (
                  <div key={f.id} className="relative group">
                    <Link href={`/destinations/${dest.slug}`} className="block">
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                        <Image src={dest.cardImage} alt={dest.name} fill sizes="320px" className="object-cover" />
                      </div>
                      <h3 className="font-display text-lg mt-3">{dest.name}</h3>
                      <p className="text-sm text-muted">{dest.region}</p>
                    </Link>
                    <button
                      onClick={() => remove(f)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-ink/40 backdrop-blur grid place-items-center text-paper hover:bg-ink/60"
                      aria-label="Remove"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {attractionFavs.length > 0 && (
          <section>
            <h2 className="font-display text-2xl mb-5">Places</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
              {attractionFavs.map((f) => {
                if (!f.destinationSlug || !f.attractionSlug) return null;
                const result = findAttraction(f.destinationSlug, f.attractionSlug);
                if (!result) return null;
                const { dest, attraction } = result;
                return (
                  <div key={f.id} className="relative group">
                    <Link
                      href={`/destinations/${dest.slug}/attractions/${attraction.slug}`}
                      className="block"
                    >
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                        <Image
                          src={attraction.image}
                          alt={attraction.name}
                          fill
                          sizes="320px"
                          className="object-cover"
                        />
                      </div>
                      <h3 className="font-display text-lg mt-3">{attraction.name}</h3>
                      <p className="text-sm text-muted">{dest.name}</p>
                    </Link>
                    <button
                      onClick={() => remove(f)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-ink/40 backdrop-blur grid place-items-center text-paper hover:bg-ink/60"
                      aria-label="Remove"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
