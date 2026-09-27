"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Destination, Festival } from "@/lib/types";

type FormState = {
  destinationSlug: string;
  slug: string;
  name: string;
  dateLabel: string;
  image: string;
  description: string;
};

function toFormState(destinationSlug: string, f?: Festival): FormState {
  return {
    destinationSlug,
    slug: f?.slug ?? "",
    name: f?.name ?? "",
    dateLabel: f?.dateLabel ?? "",
    image: f?.image ?? "",
    description: f?.description ?? "",
  };
}

export default function EventForm({
  mode,
  initialDestinationSlug,
  initial,
}: {
  mode: "create" | "edit";
  initialDestinationSlug?: string;
  initial?: Festival;
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
      dateLabel: form.dateLabel,
      image: form.image,
      description: form.description,
    };

    const url =
      mode === "create"
        ? `/api/destinations/${form.destinationSlug}/festivals`
        : `/api/destinations/${form.destinationSlug}/festivals/${initial!.slug}`;

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
    router.push("/admin/events");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-6">
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
            placeholder="diwali"
            className="input disabled:opacity-60"
          />
        </Field>
      </div>

      <Field label="Date / season label">
        <input value={form.dateLabel} onChange={(e) => set("dateLabel", e.target.value)} placeholder="October / November" className="input" />
      </Field>

      <Field label="Image URL">
        <input value={form.image} onChange={(e) => set("image", e.target.value)} className="input" />
      </Field>

      <Field label="Description">
        <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} className="input resize-none" />
      </Field>

      {error && <p className="text-sm text-terracotta">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-terracotta text-paper text-sm font-medium px-6 py-3 hover:bg-terracotta/90 transition-colors disabled:opacity-60"
      >
        {saving ? "Saving…" : mode === "create" ? "Create event" : "Save changes"}
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
