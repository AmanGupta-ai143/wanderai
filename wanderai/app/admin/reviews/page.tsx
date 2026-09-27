"use client";

import { useEffect, useState } from "react";
import { Star, Trash2 } from "lucide-react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";

type Review = {
  id: string;
  userName: string;
  destinationName: string;
  attractionName: string;
  rating: number;
  text: string;
  createdAt: string;
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  function load() {
    fetch("/api/admin/reviews")
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews));
  }

  useEffect(load, []);

  async function remove(id: string) {
    if (!confirm("Delete this review? This can't be undone.")) return;
    setDeleting(id);
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    setDeleting(null);
    load();
  }

  return (
    <AdminGuard>
      <AdminShell>
        <p className="text-xs tracking-wide text-terracotta mb-2">MODERATION</p>
        <h1 className="font-display text-3xl mb-8">Reviews</h1>

        <div className="rounded-2xl bg-white border border-ink/8 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sand/60 text-left text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Reviewer</th>
                <th className="px-5 py-3 font-medium">Place</th>
                <th className="px-5 py-3 font-medium">Rating</th>
                <th className="px-5 py-3 font-medium">Review</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews?.map((r) => (
                <tr key={r.id} className="border-t border-ink/8 align-top">
                  <td className="px-5 py-3.5 font-medium whitespace-nowrap">{r.userName}</td>
                  <td className="px-5 py-3.5 text-muted whitespace-nowrap">
                    {r.attractionName}
                    <br />
                    <span className="text-xs">{r.destinationName}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <Star size={12} className="fill-gold text-gold" strokeWidth={0} /> {r.rating}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-ink/80 max-w-md">{r.text}</td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => remove(r.id)}
                      disabled={deleting === r.id}
                      className="text-ink/60 hover:text-terracotta disabled:opacity-40"
                      aria-label="Delete review"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reviews?.length === 0 && <p className="text-center text-muted py-10">No reviews yet.</p>}
        </div>
      </AdminShell>
    </AdminGuard>
  );
}
