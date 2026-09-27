"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Destination, Hotel } from "@/lib/types";

type FormState = {
  destinationSlug: string;
  slug: string;
  name: string;
  tier: "Budget" | "Mid-range" | "Luxury";
  pricePerNight: number;
  rating: number;
  image: string;
  lat: number;
  lng: number;
};

function toFormState(destinationSlug: string, h?: Hotel): FormState {
  return {
    destinationSlug,
    slug: h?.slug ?? "",
    name: h?.name ?? "",
    tier: h?.tier ?? "Mid-range",
    pricePerNight: h?.pricePerNight ?? 3000,
    rating: h?.rating ?? 4.5,
    image: h?.image ?? "",
    lat: h?.lat ?? 20.5937,
    lng: h?.lng ?? 78.9629,
  };
}

export default function HotelForm({
  mode,
  initialDestinationSlug,
  initial,
}: {
  mode: "create" | "edit";
  initialDestinationSlug?: string;
  initial?: Hotel;
}) {
  const router = useRouter();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [form, setForm] = useState<FormState>(toFormState(initialDestinationSlug ?? "", initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/destinations")
      .then((r) => r.json())
      .then((d) => {
        const list: Destination[] = d.destinations ?? [];
        setDestinations(list);
        if (mode === "create") {
          setForm((f) => ({ ...f, destinationSlug: f.destinationSlug || list[0]?.slug || "" }));
        }
      });
  }, [mode]);

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
      tier: form.tier,
      pricePerNight: Number(form.pricePerNight),
      rating: Number(form.rating),
      image: form.image,
      lat: Number(form.lat),
      lng: Number(form.lng),
    };

    const url =
      mode === "create"
        ? `/api/destinations/${form.destinationSlug}/hotels`
        : `/api/destinations/${form.destinationSlug}/hotels/${initial!.slug}`;

    const res = await fetch(url, {
      method: mode === "create" ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    router.push("/admin/hotels");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Destination">
          <select
            required
            disabled={mode === "edit"}
            value={form.destinationSlug}
            onChange={(e) => set("destinationSlug", e.target.value)}
            className="input disabled:opacity-60"
          >
            {destinations.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tier">
          <select value={form.tier} onChange={(e) => set("tier", e.target.value as FormState["tier"])} className="input">
            <option value="Budget">Budget</option>
            <option value="Mid-range">Mid-range</option>
            <option value="Luxury">Luxury</option>
          </select>
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Name">
          <input required value={form.name} onChange={(e) => set("name", e.target.value)} className="input" />
        </Field>
        <Field label="Slug (URL)">
          <input
            required
            disabled={mode === "edit"}
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="royal-heritage-haveli"
            className="input disabled:opacity-60"
          />
        </Field>
      </div>

      <Field label="Image URL">
        <input value={form.image} onChange={(e) => set("image", e.target.value)} className="input" />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Price per night (₹)">
          <input type="number" value={form.pricePerNight} onChange={(e) => set("pricePerNight", Number(e.target.value))} className="input" />
        </Field>
        <Field label="Rating">
          <input type="number" min={0} max={5} step={0.1} value={form.rating} onChange={(e) => set("rating", Number(e.target.value))} className="input" />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Coordinates — latitude">
          <input type="number" step="any" value={form.lat} onChange={(e) => set("lat", Number(e.target.value))} className="input" />
        </Field>
        <Field label="Coordinates — longitude">
          <input type="number" step="any" value={form.lng} onChange={(e) => set("lng", Number(e.target.value))} className="input" />
        </Field>
      </div>

      {error && <p className="text-sm text-terracotta">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-terracotta text-paper text-sm font-medium px-6 py-3 hover:bg-terracotta/90 transition-colors disabled:opacity-60"
      >
        {saving ? "Saving…" : mode === "create" ? "Create hotel" : "Save changes"}
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
