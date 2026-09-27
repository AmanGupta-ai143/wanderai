"use client";

import { useEffect, useState } from "react";
import { Minus, Plus, TrainFront, BedDouble, UtensilsCrossed, Ticket, Car } from "lucide-react";
import { Destination } from "@/lib/types";

type Style = "budget" | "standard" | "luxury";

const STYLE_OPTIONS: { key: Style; label: string }[] = [
  { key: "budget", label: "Budget" },
  { key: "standard", label: "Standard" },
  { key: "luxury", label: "Luxury" },
];

const CATEGORY_META = [
  { key: "transportation", label: "Transportation", icon: TrainFront, color: "bg-terracotta" },
  { key: "accommodation", label: "Accommodation", icon: BedDouble, color: "bg-olive" },
  { key: "food", label: "Food", icon: UtensilsCrossed, color: "bg-gold" },
  { key: "activities", label: "Activities", icon: Ticket, color: "bg-terracotta/70" },
  { key: "localTransport", label: "Local Transport", icon: Car, color: "bg-olive/70" },
] as const;

type BudgetResult = {
  breakdown: Record<(typeof CATEGORY_META)[number]["key"], number>;
  total: number;
  perPerson: number;
};

function Stepper({
  value,
  onChange,
  min = 1,
  max = 20,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-9 h-9 rounded-full border border-ink/15 grid place-items-center hover:bg-sand transition-colors"
        aria-label="Decrease"
      >
        <Minus size={14} />
      </button>
      <span className="w-8 text-center font-display text-lg">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-9 h-9 rounded-full border border-ink/15 grid place-items-center hover:bg-sand transition-colors"
        aria-label="Increase"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

function StyleToggle({
  value,
  onChange,
}: {
  value: Style;
  onChange: (v: Style) => void;
}) {
  return (
    <div className="flex gap-2">
      {STYLE_OPTIONS.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`flex-1 text-sm rounded-full py-2.5 transition-colors ${
            value === opt.key
              ? "bg-ink text-paper"
              : "bg-sand text-ink/70 hover:bg-ink/10"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function BudgetCalculator() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [destinationSlug, setDestinationSlug] = useState("");
  const [people, setPeople] = useState(2);
  const [days, setDays] = useState(4);
  const [travelStyle, setTravelStyle] = useState<Style>("standard");
  const [accommodationStyle, setAccommodationStyle] = useState<Style>("standard");
  const [result, setResult] = useState<BudgetResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function calculate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ people, days, travelStyle, accommodationStyle }),
      });
      if (!res.ok) throw new Error("Couldn't calculate budget");
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Something went wrong — try again.");
    } finally {
      setLoading(false);
    }
  }

  // Calculate once on load with defaults, matching the spec's worked example.
  useEffect(() => {
    calculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetch("/api/destinations")
      .then((r) => r.json())
      .then((d) => {
        const list: Destination[] = d.destinations ?? [];
        setDestinations(list);
        setDestinationSlug((current) => current || list[0]?.slug || "");
      });
  }, []);

  const maxCategory = result
    ? Math.max(...CATEGORY_META.map((c) => result.breakdown[c.key]))
    : 1;

  return (
    <div className="grid lg:grid-cols-2 gap-10 items-start">
      {/* Form */}
      <div className="rounded-3xl bg-white border border-ink/8 shadow-sm p-7 md:p-8">
        <p className="text-xs tracking-wide text-terracotta mb-6">TRIP COST CALCULATOR</p>

        <label className="block text-sm text-muted mb-2">Destination</label>
        <select
          value={destinationSlug}
          onChange={(e) => setDestinationSlug(e.target.value)}
          className="w-full mb-6 border border-ink/15 rounded-xl px-4 py-3 text-sm bg-paper"
        >
          {destinations.map((d) => (
            <option key={d.slug} value={d.slug}>
              {d.name}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm text-muted mb-2">Travelers</label>
            <Stepper value={people} onChange={setPeople} />
          </div>
          <div>
            <label className="block text-sm text-muted mb-2">Days</label>
            <Stepper value={days} onChange={setDays} min={1} max={30} />
          </div>
        </div>

        <label className="block text-sm text-muted mb-2">Travel style</label>
        <div className="mb-6">
          <StyleToggle value={travelStyle} onChange={setTravelStyle} />
        </div>

        <label className="block text-sm text-muted mb-2">Accommodation</label>
        <div className="mb-8">
          <StyleToggle value={accommodationStyle} onChange={setAccommodationStyle} />
        </div>

        <button
          onClick={calculate}
          disabled={loading}
          className="w-full rounded-full bg-terracotta text-paper text-sm font-medium py-3.5 hover:bg-terracotta/90 transition-colors disabled:opacity-60"
        >
          {loading ? "Calculating…" : "Calculate"}
        </button>
        {error && <p className="text-xs text-terracotta mt-3">{error}</p>}
      </div>

      {/* Result */}
      <div className="rounded-3xl bg-ink text-paper p-7 md:p-8 lg:sticky lg:top-32">
        <p className="text-xs tracking-wide text-paper/50 mb-2">ESTIMATED COST</p>
        <p className="font-display text-4xl md:text-5xl mb-1">
          {result ? `₹${result.total.toLocaleString("en-IN")}` : "—"}
        </p>
        <p className="text-sm text-paper/60 mb-8">
          {result ? `₹${result.perPerson.toLocaleString("en-IN")} per person` : ""}
        </p>

        <div className="space-y-4">
          {CATEGORY_META.map(({ key, label, icon: Icon, color }) => {
            const amount = result?.breakdown[key] ?? 0;
            const pct = result ? Math.max(6, (amount / maxCategory) * 100) : 0;
            return (
              <div key={key}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="flex items-center gap-2 text-paper/85">
                    <Icon size={14} /> {label}
                  </span>
                  <span className="text-paper/70">
                    {result ? `₹${amount.toLocaleString("en-IN")}` : "—"}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-paper/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
