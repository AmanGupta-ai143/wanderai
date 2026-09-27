"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import SearchBar from "@/components/SearchBar";
import { Destination } from "@/lib/types";

const NATURAL_QUERIES = [
  "Best historical places near Delhi",
  "Cheap places to visit in India",
  "Best beaches for a 4-day trip",
  "Places for food lovers",
];

function SearchResults() {
  const params = useSearchParams();
  const q = (params.get("q") ?? "").trim();
  const [results, setResults] = useState<Destination[] | null>(null);

  useEffect(() => {
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d) => setResults(d.results ?? []));
  }, [q]);

  return (
    <div className="pt-28 pb-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-10 text-center">
        <p className="text-xs tracking-wide text-terracotta mb-3">SEARCH</p>
        <h1 className="font-display text-4xl md:text-5xl mb-8">
          {q ? `Results for “${q}”` : "Search destinations"}
        </h1>
        <div className="flex justify-center">
          <SearchBar variant="compact" />
        </div>

        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {NATURAL_QUERIES.map((nq) => (
            <span
              key={nq}
              className="text-xs px-3.5 py-2 rounded-full bg-sand text-ink/70"
            >
              &ldquo;{nq}&rdquo;
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 lg:px-10 mt-16">
        {results === null ? (
          <p className="text-center text-muted">Searching…</p>
        ) : results.length === 0 ? (
          <p className="text-center text-muted">
            No destinations matched — try a different city or region.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {results.map((d) => (
              <Link
                key={d.slug}
                href={`/destinations/${d.slug}`}
                className="group flex gap-5 rounded-2xl border border-ink/10 p-4 hover:border-terracotta/40 hover:shadow-md transition-all"
              >
                <div className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden">
                  <Image src={d.cardImage} alt={d.name} fill sizes="112px" className="object-cover" />
                </div>
                <div className="py-1">
                  <h2 className="font-display text-xl">{d.name}</h2>
                  <p className="text-sm text-muted">
                    {d.region}, {d.country}
                  </p>
                  <p className="text-sm text-ink/70 italic mt-1">&ldquo;{d.tagline}&rdquo;</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-ink/70">
                    <span className="flex items-center gap-1">
                      <Star size={11} className="fill-gold text-gold" strokeWidth={0} /> {d.rating}
                    </span>
                    {d.tags.slice(0, 2).map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                  <span className="inline-block mt-3 text-xs font-medium text-terracotta">
                    Explore destination →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="pt-32 text-center text-muted">Loading…</div>}>
      <SearchResults />
    </Suspense>
  );
}
