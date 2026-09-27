"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Destination } from "@/lib/types";

// Placeholder content used to keep newly-created destinations' sub-pages
// (best-time calendar, language guide, etc.) from rendering blank/broken —
// admins can flesh these out with dedicated screens later (see README).
function emptyDestinationDefaults() {
  return {
    didYouKnow: ["Add a fun fact about this destination in the admin panel."],
    attractions: [],
    history: [],
    culture: [],
    food: [],
    gallery: [],
    hotels: [],
    restaurants: [],
    festivals: [],
    shopping: [],
    transport: [
      {
        mode: "Flight",
        from: "—",
        approxTime: "—",
        approxCost: "—",
        detail: "Add transport details in the admin panel.",
      },
    ],
    languageGuide: {
      primary: "English",
      alsoCommon: [],
      phrases: [{ phrase: "Hello", translation: "Hello", phonetic: "heh-loh" }],
    },
    weather: {
      tempC: 28,
      feelsLikeC: 30,
      humidity: 50,
      windKmh: 10,
      condition: "Sunny" as const,
      forecast: [
        { label: "Today", tempC: 28, condition: "Sunny" as const },
        { label: "Tomorrow", tempC: 28, condition: "Sunny" as const },
        { label: "Wed", tempC: 27, condition: "Partly Cloudy" as const },
        { label: "Thu", tempC: 28, condition: "Sunny" as const },
        { label: "Fri", tempC: 29, condition: "Sunny" as const },
      ],
    },
    bestTimeCalendar: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ].map((month) => ({
      month,
      score: 1 as const,
      note: "Add seasonal details in the admin panel.",
    })),
    safety: {
      emergency: { police: "100", ambulance: "108", fire: "101" },
      tips: ["Add local safety tips in the admin panel."],
    },
  };
}

type FormState = {
  slug: string;
  name: string;
  tagline: string;
  region: string;
  country: string;
  rating: number;
  heroImage: string;
  cardImage: string;
  tags: string;
  bestTime: string;
  weather: string;
  budget: string;
  language: string;
  stay: string;
  intro: string;
  lat: number;
  lng: number;
};

function toFormState(d?: Destination): FormState {
  return {
    slug: d?.slug ?? "",
    name: d?.name ?? "",
    tagline: d?.tagline ?? "",
    region: d?.region ?? "",
    country: d?.country ?? "India",
    rating: d?.rating ?? 4.5,
    heroImage: d?.heroImage ?? "",
    cardImage: d?.cardImage ?? "",
    tags: d?.tags.join(", ") ?? "",
    bestTime: d?.bestTime ?? "",
    weather: d?.quickFacts.weather ?? "",
    budget: d?.quickFacts.budget ?? "₹₹",
    language: d?.quickFacts.language ?? "",
    stay: d?.quickFacts.stay ?? "",
    intro: d?.intro ?? "",
    lat: d?.center.lat ?? 20.5937,
    lng: d?.center.lng ?? 78.9629,
  };
}

export default function DestinationForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: Destination;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(toFormState(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      slug: form.slug.trim().toLowerCase().replace(/\s+/g, "-"),
      name: form.name,
      tagline: form.tagline,
      region: form.region,
      country: form.country,
      rating: Number(form.rating),
      heroImage: form.heroImage,
      cardImage: form.cardImage || form.heroImage,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      bestTime: form.bestTime,
      quickFacts: {
        weather: form.weather,
        budget: form.budget,
        language: form.language,
        stay: form.stay,
      },
      intro: form.intro,
      center: { lat: Number(form.lat), lng: Number(form.lng) },
      ...(mode === "create" ? emptyDestinationDefaults() : {}),
    };

    const res = await fetch(
      mode === "create" ? "/api/destinations" : `/api/destinations/${initial!.slug}`,
      {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    router.push("/admin/destinations");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Name">
          <input
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Slug (URL)">
          <input
            required
            disabled={mode === "edit"}
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="udaipur"
            className="input disabled:opacity-60"
          />
        </Field>
      </div>

      <Field label="Tagline">
        <input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} className="input" />
      </Field>

      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="State / Region">
          <input required value={form.region} onChange={(e) => set("region", e.target.value)} className="input" />
        </Field>
        <Field label="Country">
          <input required value={form.country} onChange={(e) => set("country", e.target.value)} className="input" />
        </Field>
        <Field label="Rating">
          <input
            type="number"
            min={0}
            max={5}
            step={0.1}
            value={form.rating}
            onChange={(e) => set("rating", Number(e.target.value))}
            className="input"
          />
        </Field>
      </div>

      <Field label="Description">
        <textarea
          value={form.intro}
          onChange={(e) => set("intro", e.target.value)}
          rows={4}
          className="input resize-none"
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Hero image URL">
          <input value={form.heroImage} onChange={(e) => set("heroImage", e.target.value)} className="input" />
        </Field>
        <Field label="Card image URL">
          <input value={form.cardImage} onChange={(e) => set("cardImage", e.target.value)} className="input" />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Coordinates — latitude">
          <input
            type="number"
            step="any"
            value={form.lat}
            onChange={(e) => set("lat", Number(e.target.value))}
            className="input"
          />
        </Field>
        <Field label="Coordinates — longitude">
          <input
            type="number"
            step="any"
            value={form.lng}
            onChange={(e) => set("lng", Number(e.target.value))}
            className="input"
          />
        </Field>
      </div>

      <Field label="Tags (comma separated)">
        <input value={form.tags} onChange={(e) => set("tags", e.target.value)} className="input" />
      </Field>

      <div className="grid sm:grid-cols-4 gap-4">
        <Field label="Best time">
          <input value={form.bestTime} onChange={(e) => set("bestTime", e.target.value)} className="input" />
        </Field>
        <Field label="Weather">
          <input value={form.weather} onChange={(e) => set("weather", e.target.value)} className="input" />
        </Field>
        <Field label="Budget level">
          <input value={form.budget} onChange={(e) => set("budget", e.target.value)} className="input" />
        </Field>
        <Field label="Languages">
          <input value={form.language} onChange={(e) => set("language", e.target.value)} className="input" />
        </Field>
      </div>

      {mode === "create" && (
        <p className="text-xs text-muted">
          Attractions, history, culture, food, gallery, hotels and restaurants aren&apos;t
          editable from this form yet — they&apos;re created with sensible placeholders you can
          replace once those admin screens exist (or by editing <code>lib/mock-data.ts</code>{" "}
          directly for now).
        </p>
      )}

      {error && <p className="text-sm text-terracotta">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-terracotta text-paper text-sm font-medium px-6 py-3 hover:bg-terracotta/90 transition-colors disabled:opacity-60"
      >
        {saving ? "Saving…" : mode === "create" ? "Create destination" : "Save changes"}
      </button>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid rgba(23, 33, 29, 0.15);
          border-radius: 0.75rem;
          padding: 0.65rem 1rem;
          font-size: 0.875rem;
          background: #faf8f3;
        }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm text-muted mb-1.5">{label}</span>
      {children}
    </label>
  );
}
