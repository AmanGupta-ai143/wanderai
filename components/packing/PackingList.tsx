"use client";

import { useEffect, useState } from "react";
import { Luggage, Plus, Check } from "lucide-react";
import { Destination } from "@/lib/types";

const ACTIVITIES = ["Adventure", "Photography", "Beach", "Culture", "Food"];

type Category = { category: string; items: string[] };
type ChecklistItem = { id: string; label: string; category: string; checked: boolean; custom?: boolean };

export default function PackingList() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [destinationSlug, setDestinationSlug] = useState("");
  const [days, setDays] = useState(5);
  const [activities, setActivities] = useState<string[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[] | null>(null);
  const [newItem, setNewItem] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/destinations")
      .then((r) => r.json())
      .then((d) => {
        const list: Destination[] = d.destinations ?? [];
        setDestinations(list);
        setDestinationSlug((current) => current || list[0]?.slug || "");
      });
  }, []);

  function toggleActivity(a: string) {
    setActivities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  }

  async function generate() {
    setLoading(true);
    const res = await fetch("/api/packing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destinationSlug, days, activities }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return;

    const items: ChecklistItem[] = (data.categories as Category[]).flatMap((c) =>
      c.items.map((item, i) => ({
        id: `${c.category}-${i}`,
        label: item,
        category: c.category,
        checked: false,
      }))
    );
    setChecklist(items);
  }

  function toggleItem(id: string) {
    setChecklist((prev) => prev?.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)) ?? null);
  }

  function addItem() {
    if (!newItem.trim() || !checklist) return;
    setChecklist([
      ...checklist,
      { id: `custom-${Date.now()}`, label: newItem.trim(), category: "Added by you", checked: false, custom: true },
    ]);
    setNewItem("");
  }

  const destination = destinations.find((d) => d.slug === destinationSlug);
  const packed = checklist?.filter((i) => i.checked).length ?? 0;
  const total = checklist?.length ?? 0;

  if (checklist && destination) {
    const categories = Array.from(new Set(checklist.map((i) => i.category)));
    return (
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs tracking-wide text-terracotta">PACK SMART</p>
          <button onClick={() => setChecklist(null)} className="text-xs text-muted hover:text-ink">
            Start over
          </button>
        </div>
        <h1 className="font-display text-3xl md:text-4xl mb-1">{destination.name}</h1>
        <p className="text-sm text-muted mb-8">
          {days} days {activities.length > 0 && `· ${activities.join(", ")}`}
        </p>

        <div className="mb-8">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted">
              {packed} / {total} packed
            </span>
          </div>
          <div className="h-2 rounded-full bg-sand overflow-hidden">
            <div
              className="h-full rounded-full bg-terracotta transition-all duration-300"
              style={{ width: `${total ? (packed / total) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="space-y-8">
          {categories.map((cat) => (
            <div key={cat}>
              <h2 className="font-display text-xl mb-3">{cat}</h2>
              <div className="space-y-2">
                {checklist
                  .filter((i) => i.category === cat)
                  .map((item) => (
                    <button
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className="w-full flex items-center gap-3 rounded-xl border border-ink/10 bg-white px-4 py-3 text-left hover:border-terracotta/40 transition-colors"
                    >
                      <span
                        className={`w-5 h-5 rounded-md border grid place-items-center shrink-0 transition-colors ${
                          item.checked ? "bg-terracotta border-terracotta" : "border-ink/25"
                        }`}
                      >
                        {item.checked && <Check size={12} className="text-paper" strokeWidth={3} />}
                      </span>
                      <span className={item.checked ? "line-through text-muted" : ""}>{item.label}</span>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-8">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            placeholder="Add your own item…"
            className="flex-1 border border-ink/15 rounded-xl px-4 py-2.5 text-sm bg-paper"
          />
          <button
            onClick={addItem}
            className="w-11 h-11 rounded-xl bg-ink text-paper grid place-items-center hover:bg-ink/90 transition-colors shrink-0"
            aria-label="Add item"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-10">
        <Luggage className="mx-auto text-gold mb-4" size={26} strokeWidth={1.5} />
        <h1 className="font-display text-3xl md:text-4xl mb-3">Pack smart</h1>
        <p className="text-muted">A checklist built for your destination and trip length.</p>
      </div>

      <div className="rounded-3xl bg-white border border-ink/8 shadow-sm p-7 md:p-8 space-y-6">
        <div>
          <label className="block text-sm text-muted mb-2">Destination</label>
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

        <div>
          <label className="block text-sm text-muted mb-2">Duration (days)</label>
          <input
            type="number"
            min={1}
            max={30}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full border border-ink/15 rounded-xl px-4 py-3 text-sm bg-paper"
          />
        </div>

        <div>
          <label className="block text-sm text-muted mb-2">Activities</label>
          <div className="flex flex-wrap gap-2">
            {ACTIVITIES.map((a) => (
              <button
                key={a}
                onClick={() => toggleActivity(a)}
                className={`text-sm px-4 py-2 rounded-full transition-colors ${
                  activities.includes(a) ? "bg-terracotta text-paper" : "bg-sand text-ink/70 hover:bg-ink/10"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={generate}
          disabled={loading || !destinationSlug}
          className="w-full rounded-full bg-terracotta text-paper text-sm font-medium py-3.5 hover:bg-terracotta/90 transition-colors disabled:opacity-60"
        >
          {loading ? "Building your list…" : "Generate packing list"}
        </button>
      </div>
    </div>
  );
}
