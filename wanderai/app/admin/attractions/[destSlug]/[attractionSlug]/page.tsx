"use client";

import { use, useEffect, useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import AttractionForm from "@/components/admin/AttractionForm";
import { Attraction } from "@/lib/types";

export default function EditAttractionPage({
  params,
}: {
  params: Promise<{ destSlug: string; attractionSlug: string }>;
}) {
  const { destSlug, attractionSlug } = use(params);
  const [attraction, setAttraction] = useState<Attraction | null | undefined>(undefined);

  useEffect(() => {
    fetch(`/api/destinations/${destSlug}/attractions/${attractionSlug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setAttraction(d?.attraction ?? null));
  }, [destSlug, attractionSlug]);

  return (
    <AdminGuard>
      <AdminShell>
        <p className="text-xs tracking-wide text-terracotta mb-2">CONTENT</p>
        <h1 className="font-display text-3xl mb-8">Edit attraction</h1>
        {attraction === undefined && <p className="text-muted">Loading…</p>}
        {attraction === null && <p className="text-muted">Attraction not found.</p>}
        {attraction && (
          <AttractionForm mode="edit" initialDestinationSlug={destSlug} initial={attraction} />
        )}
      </AdminShell>
    </AdminGuard>
  );
}
