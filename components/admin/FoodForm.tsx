"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Destination, FoodItem } from "@/lib/types";

type FormState = {
  destinationSlug: string;
  slug: string;
  name: string;
  origin: string;
  image: string;
  description: string;
  ingredients: string;
  taste: string;
  significance: string;
  whereToTry: string;
};

function toFormState(destinationSlug: string, f?: FoodItem): FormState {
  return {
    destinationSlug,
    slug: f?.slug ?? "",
    name: f?.name ?? "",
    origin: f?.origin ?? "",
    image: f?.image ?? "",
    description: f?.description ?? "",
    ingredients: f?.ingredients.join(", ") ?? "",
    taste: f?.taste ?? "",
    significance: f?.significance ?? "",
    whereToTry: f?.whereToTry ?? "",
  };
}

export default function FoodForm({
  mode,
  initialDestinationSlug,
  initial,
}: {
  mode: "create" | "edit";
  initialDestinationSlug?: string;
  initial?: FoodItem;
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
      origin: form.origin,
      image: form.image,
      description: form.description,
      ingredients: form.ingredients.split(",").map((i) => i.trim()).filter(Boolean),
      taste: form.taste,
      significance: form.significance,
      whereToTry: form.whereToTry,
    };

    const url =
      mode === "create"
        ? `/api/destinations/${form.destinationSlug}/food`
        : `/api/destinations/${form.destinationSlug}/food/${initial!.slug}`;

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
    router.push("/admin/food");
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
        <Field label="Origin">
          <input value={form.origin} onChange={(e) => set("origin", e.target.value)} className="input" />
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
            placeholder="dal-baati-churma"
            className="input disabled:opacity-60"
          />
        </Field>
      </div>

      <Field label="Description">
        <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} className="input resize-none" />
      </Field>

      <Field label="Image URL">
        <input value={form.image} onChange={(e) => set("image", e.target.value)} className="input" />
      </Field>

      <Field label="Ingredients (comma separated)">
        <input value={form.ingredients} onChange={(e) => set("ingredients", e.target.value)} className="input" />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Taste">
          <input value={form.taste} onChange={(e) => set("taste", e.target.value)} className="input" />
        </Field>
        <Field label="Where to try">
          <input value={form.whereToTry} onChange={(e) => set("whereToTry", e.target.value)} className="input" />
        </Field>
      </div>

      <Field label="Cultural significance">
        <textarea value={form.significance} onChange={(e) => set("significance", e.target.value)} rows={2} className="input resize-none" />
      </Field>

      {error && <p className="text-sm text-terracotta">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-terracotta text-paper text-sm font-medium px-6 py-3 hover:bg-terracotta/90 transition-colors disabled:opacity-60"
      >
        {saving ? "Saving…" : mode === "create" ? "Create food item" : "Save changes"}
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
