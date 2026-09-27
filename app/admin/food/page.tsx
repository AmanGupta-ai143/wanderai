"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import { Destination } from "@/lib/types";

export default function AdminFoodPage() {
  const [destinations, setDestinations] = useState<Destination[] | null>(null);
  const [filter, setFilter] = useState("All");
  const [deleting, setDeleting] = useState<string | null>(null);

  function load() {
    fetch("/api/destinations")
      .then((r) => r.json())
      .then((d) => setDestinations(d.destinations));
  }
  useEffect(load, []);

  async function remove(destSlug: string, foodSlug: string) {
    if (!confirm(`Delete ${foodSlug}? This can't be undone.`)) return;
    setDeleting(foodSlug);
    await fetch(`/api/destinations/${destSlug}/food/${foodSlug}`, { method: "DELETE" });
    setDeleting(null);
    load();
  }

  const rows = destinations?.flatMap((d) => d.food.map((f) => ({ dest: d, food: f }))) ?? [];
  const filtered = filter === "All" ? rows : rows.filter((r) => r.dest.slug === filter);

  return (
    <AdminGuard>
      <AdminShell>
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="text-xs tracking-wide text-terracotta mb-2">CONTENT</p>
            <h1 className="font-display text-3xl">Food</h1>
          </div>
          <Link
            href="/admin/food/new"
            className="flex items-center gap-2 rounded-full bg-terracotta text-paper text-sm font-medium px-5 py-2.5 hover:bg-terracotta/90 transition-colors"
          >
            <Plus size={15} /> Add food item
          </Link>
        </div>

        {destinations && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button onClick={() => setFilter("All")} className={`text-sm px-4 py-2 rounded-full ${filter === "All" ? "bg-ink text-paper" : "bg-white border border-ink/10 text-ink/70"}`}>
              All
            </button>
            {destinations.map((d) => (
              <button key={d.slug} onClick={() => setFilter(d.slug)} className={`text-sm px-4 py-2 rounded-full ${filter === d.slug ? "bg-ink text-paper" : "bg-white border border-ink/10 text-ink/70"}`}>
                {d.name}
              </button>
            ))}
          </div>
        )}

        <div className="rounded-2xl bg-white border border-ink/8 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sand/60 text-left text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Destination</th>
                <th className="px-5 py-3 font-medium">Origin</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ dest, food }) => (
                <tr key={`${dest.slug}-${food.slug}`} className="border-t border-ink/8">
                  <td className="px-5 py-3.5 font-medium">{food.name}</td>
                  <td className="px-5 py-3.5 text-muted">{dest.name}</td>
                  <td className="px-5 py-3.5 text-muted">{food.origin}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/food/${dest.slug}/${food.slug}`} className="text-ink/60 hover:text-terracotta" aria-label="Edit">
                        <Pencil size={15} />
                      </Link>
                      <button onClick={() => remove(dest.slug, food.slug)} disabled={deleting === food.slug} className="text-ink/60 hover:text-terracotta disabled:opacity-40" aria-label="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center text-muted py-10">No food items yet.</p>}
        </div>
      </AdminShell>
    </AdminGuard>
  );
}
