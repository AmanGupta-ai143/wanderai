"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import { Destination } from "@/lib/types";

export default function AdminCulturePage() {
  const [destinations, setDestinations] = useState<Destination[] | null>(null);
  const [filter, setFilter] = useState("All");
  const [deleting, setDeleting] = useState<string | null>(null);

  function load() {
    fetch("/api/destinations")
      .then((r) => r.json())
      .then((d) => setDestinations(d.destinations));
  }
  useEffect(load, []);

  async function remove(destSlug: string, itemSlug: string) {
    if (!confirm(`Delete ${itemSlug}? This can't be undone.`)) return;
    setDeleting(itemSlug);
    await fetch(`/api/destinations/${destSlug}/culture/${itemSlug}`, { method: "DELETE" });
    setDeleting(null);
    load();
  }

  const rows = destinations?.flatMap((d) => d.culture.map((c) => ({ dest: d, item: c }))) ?? [];
  const filtered = filter === "All" ? rows : rows.filter((r) => r.dest.slug === filter);

  return (
    <AdminGuard>
      <AdminShell>
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="text-xs tracking-wide text-terracotta mb-2">CONTENT</p>
            <h1 className="font-display text-3xl">Culture</h1>
          </div>
          <Link
            href="/admin/culture/new"
            className="flex items-center gap-2 rounded-full bg-terracotta text-paper text-sm font-medium px-5 py-2.5 hover:bg-terracotta/90 transition-colors"
          >
            <Plus size={15} /> Add culture item
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
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Destination</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ dest, item }) => (
                <tr key={`${dest.slug}-${item.slug}`} className="border-t border-ink/8">
                  <td className="px-5 py-3.5 font-medium">{item.title}</td>
                  <td className="px-5 py-3.5 text-muted">{dest.name}</td>
                  <td className="px-5 py-3.5 text-muted">{item.category}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/culture/${dest.slug}/${item.slug}`} className="text-ink/60 hover:text-terracotta" aria-label="Edit">
                        <Pencil size={15} />
                      </Link>
                      <button onClick={() => remove(dest.slug, item.slug)} disabled={deleting === item.slug} className="text-ink/60 hover:text-terracotta disabled:opacity-40" aria-label="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center text-muted py-10">No culture items yet.</p>}
        </div>
      </AdminShell>
    </AdminGuard>
  );
}
