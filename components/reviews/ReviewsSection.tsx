"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Sparkles, ThumbsUp, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/client/AuthProvider";
import { summarizeReviews } from "@/lib/client/reviewSummary";

type Review = {
  id: string;
  userName: string;
  rating: number;
  text: string;
  createdAt: string;
};

export default function ReviewsSection({
  destSlug,
  attractionSlug,
}: {
  destSlug: string;
  attractionSlug: string;
}) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endpoint = `/api/destinations/${destSlug}/attractions/${attractionSlug}/reviews`;

  useEffect(() => {
    fetch(endpoint)
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews ?? []));
  }, [endpoint]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setError(null);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, text }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Couldn't post your review");
      return;
    }
    setReviews((prev) => [data.review, ...(prev ?? [])]);
    setText("");
    setRating(5);
  }

  const avg =
    reviews && reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const summary = reviews ? summarizeReviews(reviews.map((r) => r.text)) : null;

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="font-display text-2xl">Traveler reviews</h2>
        {avg && (
          <span className="flex items-center gap-1 text-sm text-ink/70">
            <Star size={13} className="fill-gold text-gold" strokeWidth={0} />
            {avg} · {reviews?.length} review{reviews?.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {summary && (
        <div className="rounded-2xl bg-olive/10 border border-olive/20 p-5 mb-8">
          <p className="text-xs tracking-wide text-olive flex items-center gap-1.5 mb-3">
            <Sparkles size={12} /> COMMON THEMES IN REVIEWS
          </p>
          <div className="space-y-2 text-sm">
            {summary.loves.length > 0 && (
              <div className="flex items-start gap-2">
                <ThumbsUp size={14} className="text-olive shrink-0 mt-0.5" />
                <span>Visitors often mention: {summary.loves.join(", ")}</span>
              </div>
            )}
            {summary.concerns.length > 0 && (
              <div className="flex items-start gap-2">
                <AlertTriangle size={14} className="text-terracotta shrink-0 mt-0.5" />
                <span>Some also mention: {summary.concerns.join(", ")}</span>
              </div>
            )}
          </div>
        </div>
      )}


      {user ? (
        <form onSubmit={submit} className="mb-8 rounded-2xl bg-sand/50 p-5">
          <div className="flex items-center gap-1.5 mb-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                type="button"
                key={n}
                onClick={() => setRating(n)}
                aria-label={`Rate ${n} stars`}
              >
                <Star
                  size={20}
                  className={n <= rating ? "fill-gold text-gold" : "text-ink/20"}
                  strokeWidth={n <= rating ? 0 : 1.5}
                />
              </button>
            ))}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share what stood out to you…"
            rows={3}
            className="w-full rounded-xl border border-ink/15 px-4 py-3 text-sm bg-paper resize-none"
          />
          {error && <p className="text-xs text-terracotta mt-2">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="mt-3 rounded-full bg-terracotta text-paper text-sm font-medium px-5 py-2.5 hover:bg-terracotta/90 transition-colors disabled:opacity-60"
          >
            {submitting ? "Posting…" : "Post review"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-muted mb-8">
          <Link href="/login" className="text-terracotta font-medium">
            Sign in
          </Link>{" "}
          to write a review.
        </p>
      )}

      <div className="space-y-5">
        {reviews?.length === 0 && (
          <p className="text-sm text-muted">Be the first to review this place.</p>
        )}
        {reviews?.map((r) => (
          <div key={r.id} className="border-b border-ink/10 pb-5">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={13}
                    className={n <= r.rating ? "fill-gold text-gold" : "text-ink/15"}
                    strokeWidth={0}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{r.userName}</span>
            </div>
            <p className="text-sm text-muted leading-relaxed">{r.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
