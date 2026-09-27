"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MapExplorer from "@/components/map/MapExplorer";
import { Destination } from "@/lib/types";

function MapPageInner() {
  const params = useSearchParams();
  const initialSlug = params.get("destination") ?? "jaipur";
  const [slug, setSlug] = useState(initialSlug);
  const [destinations, setDestinations] = useState<Destination[] | null>(null);

  useEffect(() => {
    fetch("/api/destinations")
      .then((r) => r.json())
      .then((d) => {
        const list: Destination[] = d.destinations ?? [];
        setDestinations(list);
        if (!list.some((dest) => dest.slug === initialSlug)) {
          setSlug(list[0]?.slug ?? "jaipur");
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!destinations) {
    return <div className="pt-32 text-center text-muted">Loading map…</div>;
  }

  const destination = destinations.find((d) => d.slug === slug) ?? destinations[0];

  return (
    <div className="pt-16 h-screen flex flex-col">
      <div className="border-b border-ink/10 px-4 md:px-6 py-3 flex items-center gap-3">
        <select
          value={destination.slug}
          onChange={(e) => setSlug(e.target.value)}
          className="text-sm font-medium border border-ink/15 rounded-full px-4 py-2 bg-paper"
        >
          {destinations.map((d) => (
            <option key={d.slug} value={d.slug}>
              {d.name}
            </option>
          ))}
        </select>
        <p className="hidden sm:block text-sm text-muted">
          Exploring places, hotels &amp; restaurants in {destination.name}
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <MapExplorer destination={destination} />
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense fallback={<div className="pt-32 text-center text-muted">Loading map…</div>}>
      <MapPageInner />
    </Suspense>
  );
}
