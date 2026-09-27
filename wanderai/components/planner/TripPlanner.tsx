"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, MapPin, Utensils } from "lucide-react";
import { useAuth } from "@/lib/client/AuthProvider";
import { Destination } from "@/lib/types";

const INTERESTS = ["History", "Food", "Culture", "Photography", "Adventure", "Shopping"];
const STYLES = ["Relaxed", "Balanced", "Packed"];
const TRAVELING_WITH = ["Solo", "Partner", "Friends", "Family"];

type ItineraryItem = {
  day: number;
  time: string;
  label: string;
  attractionSlug?: string;
  estimatedCost: number;
};

type Itinerary = {
  id: string;
  destinationSlug: string;
  days: number;
  items: ItineraryItem[];
};

export default function TripPlanner() {
  const { user } = useAuth();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [destinationSlug, setDestinationSlug] = useState("");
  const [days, setDays] = useState(4);
  const [budget, setBudget] = useState(25000);
  const [travelingWith, setTravelingWith] = useState("Friends");
  const [interests, setInterests] = useState<string[]>(["History", "Food"]);
  const [style, setStyle] = useState("Balanced");
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [activeDay, setActiveDay] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/destinations")
      .then((r) => r.json())
      .then((d) => {
        const list: Destination[] = d.destinations ?? [];
        setDestinations(list);
        setDestinationSlug((current) => current || list[0]?.slug || "");
      });
  }, []);

  function toggleInterest(i: string) {
    setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  }

  async function generate() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/itineraries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        destinationSlug,
        days,
        budget,
        travelStyle: style,
        interests,
        travelingWith,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Couldn't generate a trip");
      return;
    }
    setItinerary(data.itinerary);
    setActiveDay(1);
  }

  const destination = destinations.find((d) => d.slug === destinationSlug);

  if (!destination) {
    return <p className="text-center text-muted pt-10">Loading…</p>;
  }

  if (itinerary) {
    const dayItems = itinerary.items.filter((i) => i.day === activeDay);
    const dayCost = dayItems.reduce((s, i) => s + i.estimatedCost, 0);

    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs tracking-wide text-terracotta">
            {destination.name.toUpperCase()} JOURNEY · {itinerary.days} DAYS
          </p>
          <button onClick={() => setItinerary(null)} className="text-xs text-muted hover:text-ink">
            Start over
          </button>
        </div>
        <h1 className="font-display text-3xl md:text-4xl mb-8">Your {destination.name} trip</h1>

        <div className="flex gap-2 mb-8 overflow-x-auto rail pb-1">
          {Array.from({ length: itinerary.days }, (_, i) => i + 1).map((d) => (
            <button
              key={d}
              onClick={() => setActiveDay(d)}
              className={`shrink-0 text-sm px-4 py-2 rounded-full transition-colors ${
                activeDay === d ? "bg-ink text-paper" : "bg-sand text-ink/70 hover:bg-ink/10"
              }`}
            >
              Day {d}
            </button>
          ))}
        </div>

        <ol className="space-y-6 border-l border-ink/15 pl-6">
          {dayItems.map((item, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[27px] top-1 w-2.5 h-2.5 rounded-full bg-terracotta" />
              <span className="text-xs text-gold font-medium">{item.time}</span>
              <div className="flex items-center gap-2 mt-1">
                {item.attractionSlug ? (
                  <MapPin size={15} className="text-olive" />
                ) : (
                  <Utensils size={15} className="text-olive" />
                )}
                {item.attractionSlug ? (
                  <Link
                    href={`/destinations/${destination.slug}/attractions/${item.attractionSlug}`}
                    className="font-display text-lg hover:text-terracotta transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="font-display text-lg">{item.label}</span>
                )}
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex items-center justify-between rounded-2xl bg-sand/60 px-5 py-4">
          <span className="text-sm text-muted">Estimated cost for Day {activeDay}</span>
          <span className="font-display text-xl">₹{dayCost.toLocaleString("en-IN")}</span>
        </div>

        <Link
          href={`/map?destination=${destination.slug}`}
          className="inline-flex mt-6 items-center gap-2 text-sm font-medium text-terracotta"
        >
          View day route on map →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-10">
        <Sparkles className="mx-auto text-gold mb-4" size={26} strokeWidth={1.5} />
        <h1 className="font-display text-3xl md:text-4xl mb-3">Plan your perfect journey</h1>
        <p className="text-muted">Tell us what you love — we&apos;ll build the itinerary.</p>
      </div>

      <div className="rounded-3xl bg-white border border-ink/8 shadow-sm p-7 md:p-8 space-y-6">
        <div>
          <label className="block text-sm text-muted mb-2">Where do you want to go?</label>
          <select
            value={destinationSlug}
            onChange={(e) => setDestinationSlug(e.target.value)}
            className="w-full border border-ink/15 rounded-xl px-4 py-3 text-sm bg-paper"
          >
            {destinations.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-muted mb-2">How long?</label>
            <input
              type="number"
              min={1}
              max={14}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full border border-ink/15 rounded-xl px-4 py-3 text-sm bg-paper"
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-2">Budget (₹)</label>
            <input
              type="number"
              min={1000}
              step={1000}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full border border-ink/15 rounded-xl px-4 py-3 text-sm bg-paper"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-muted mb-2">Traveling with?</label>
          <div className="flex flex-wrap gap-2">
            {TRAVELING_WITH.map((t) => (
              <button
                key={t}
                onClick={() => setTravelingWith(t)}
                className={`text-sm px-4 py-2 rounded-full transition-colors ${
                  travelingWith === t ? "bg-ink text-paper" : "bg-sand text-ink/70 hover:bg-ink/10"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-muted mb-2">What do you love?</label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((i) => (
              <button
                key={i}
                onClick={() => toggleInterest(i)}
                className={`text-sm px-4 py-2 rounded-full transition-colors ${
                  interests.includes(i) ? "bg-terracotta text-paper" : "bg-sand text-ink/70 hover:bg-ink/10"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-muted mb-2">Travel style</label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full border border-ink/15 rounded-xl px-4 py-3 text-sm bg-paper"
          >
            {STYLES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-terracotta">{error}</p>}

        {user ? (
          <button
            onClick={generate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-terracotta text-paper text-sm font-medium py-3.5 hover:bg-terracotta/90 transition-colors disabled:opacity-60"
          >
            <Sparkles size={15} /> {loading ? "Building your trip…" : "Generate My Trip"}
          </button>
        ) : (
          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 rounded-full bg-ink text-paper text-sm font-medium py-3.5 hover:bg-ink/90 transition-colors"
          >
            Sign in to generate a trip
          </Link>
        )}
      </div>
    </div>
  );
}
