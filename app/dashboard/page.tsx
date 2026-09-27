"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Compass, MapPin, Settings } from "lucide-react";
import { useAuth } from "@/lib/client/AuthProvider";
import { Destination } from "@/lib/types";

type Itinerary = {
  id: string;
  destinationSlug: string;
  days: number;
  budget: number;
  createdAt: string;
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [itineraries, setItineraries] = useState<Itinerary[] | null>(null);
  const [favoriteCount, setFavoriteCount] = useState<number | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);

  useEffect(() => {
    fetch("/api/destinations")
      .then((r) => r.json())
      .then((d) => setDestinations(d.destinations ?? []));
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch("/api/itineraries")
      .then((r) => r.json())
      .then((d) => setItineraries(d.itineraries ?? []));
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((d) => setFavoriteCount((d.favorites ?? []).length));
  }, [user]);

  if (loading) return <div className="pt-32 text-center text-muted">Loading…</div>;

  if (!user) {
    return (
      <div className="pt-32 pb-24 text-center px-6">
        <h1 className="font-display text-3xl mb-3">Sign in to see your dashboard</h1>
        <Link
          href="/login"
          className="inline-block mt-4 rounded-full bg-terracotta text-paper text-sm font-medium px-6 py-3 hover:bg-terracotta/90 transition-colors"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        <div className="flex items-start justify-between mb-14">
          <div>
            <p className="text-muted mb-1">Good to see you</p>
            <h1 className="font-display text-4xl md:text-5xl">{user.name.split(" ")[0]} 👋</h1>
          </div>
          <Link
            href="/settings"
            className="flex items-center gap-1.5 text-sm text-muted hover:text-ink mt-2"
          >
            <Settings size={15} /> Settings
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-5 mb-16">
          <Link
            href="/wishlist"
            className="rounded-2xl bg-white border border-ink/8 p-6 hover:border-terracotta/40 transition-colors"
          >
            <Heart size={18} className="text-terracotta mb-3" />
            <p className="font-display text-2xl">{favoriteCount ?? "—"}</p>
            <p className="text-sm text-muted">Saved places</p>
          </Link>
          <div className="rounded-2xl bg-white border border-ink/8 p-6">
            <Compass size={18} className="text-olive mb-3" />
            <p className="font-display text-2xl">{itineraries?.length ?? "—"}</p>
            <p className="text-sm text-muted">Trips planned</p>
          </div>
          <Link
            href="/trip-planner"
            className="rounded-2xl bg-ink text-paper p-6 flex flex-col justify-between hover:bg-ink/90 transition-colors"
          >
            <MapPin size={18} className="text-gold mb-3" />
            <p className="text-sm">Plan a new trip with AI →</p>
          </Link>
        </div>

        <h2 className="font-display text-2xl mb-6">Your trips</h2>
        {itineraries && itineraries.length === 0 && (
          <p className="text-muted mb-16">
            No trips yet —{" "}
            <Link href="/trip-planner" className="text-terracotta font-medium">
              plan your first one
            </Link>
            .
          </p>
        )}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {itineraries?.map((it) => {
            const dest = destinations.find((d) => d.slug === it.destinationSlug);
            if (!dest) return null;
            return (
              <Link
                key={it.id}
                href={`/destinations/${dest.slug}`}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden block"
              >
                <Image src={dest.cardImage} alt={dest.name} fill sizes="320px" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 to-transparent" />
                <div className="absolute bottom-4 left-4 text-paper">
                  <p className="font-display text-xl">{dest.name}</p>
                  <p className="text-sm text-paper/75">
                    {it.days} days · ₹{it.budget.toLocaleString("en-IN")}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <h2 className="font-display text-2xl mb-6">Explore more</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {destinations.map((d) => (
            <Link key={d.slug} href={`/destinations/${d.slug}`} className="group block">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                <Image src={d.cardImage} alt={d.name} fill sizes="200px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <p className="font-display text-base mt-2.5">{d.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
