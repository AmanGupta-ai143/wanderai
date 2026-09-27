"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import { Destination } from "@/lib/types";

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[] | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  function load() {
    fetch("/api/destinations")
      .then((r) => r.json())
      .then((d) => setDestinations(d.destinations));
  }

  useEffect(load, []);

  async function remove(slug: string) {
    if (!confirm(`Delete ${slug}? This can't be undone.`)) return;
    setDeleting(slug);
    await fetch(`/api/destinations/${slug}`, { method: "DELETE" });
    setDeleting(null);
    load();
  }

  return (
    <AdminGuard>
      <AdminShell>
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs tracking-wide text-terracotta mb-2">CONTENT</p>
            <h1 className="font-display text-3xl">Destinations</h1>
          </div>
          <Link
            href="/admin/destinations/new"
            className="flex items-center gap-2 rounded-full bg-terracotta text-paper text-sm font-medium px-5 py-2.5 hover:bg-terracotta/90 transition-colors"
          >
            <Plus size={15} /> Add destination
          </Link>
        </div>

        <div className="rounded-2xl bg-white border border-ink/8 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sand/60 text-left text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Region</th>
                <th className="px-5 py-3 font-medium">Rating</th>
                <th className="px-5 py-3 font-medium">Attractions</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {destinations?.map((d) => (
                <tr key={d.slug} className="border-t border-ink/8">
                  <td className="px-5 py-3.5 font-medium">{d.name}</td>
                  <td className="px-5 py-3.5 text-muted">
                    {d.region}, {d.country}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-1">
                      <Star size={12} className="fill-gold text-gold" strokeWidth={0} /> {d.rating}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted">{d.attractions.length}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/destinations/${d.slug}`}
                        className="text-ink/60 hover:text-terracotta"
                        aria-label="Edit"
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        onClick={() => remove(d.slug)}
                        disabled={deleting === d.slug}
                        className="text-ink/60 hover:text-terracotta disabled:opacity-40"
                        aria-label="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {destinations?.length === 0 && (
            <p className="text-center text-muted py-10">No destinations yet.</p>
          )}
        </div>
      </AdminShell>
    </AdminGuard>
  );
}
