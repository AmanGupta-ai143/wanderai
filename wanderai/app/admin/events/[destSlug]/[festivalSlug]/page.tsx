"use client";

import { use, useEffect, useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import EventForm from "@/components/admin/EventForm";
import { Festival } from "@/lib/types";

export default function EditEventPage({
  params,
}: {
  params: Promise<{ destSlug: string; festivalSlug: string }>;
}) {
  const { destSlug, festivalSlug } = use(params);
  const [festival, setFestival] = useState<Festival | null | undefined>(undefined);

  useEffect(() => {
    fetch(`/api/destinations/${destSlug}/festivals`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setFestival(d?.festivals?.find((f: Festival) => f.slug === festivalSlug) ?? null));
  }, [destSlug, festivalSlug]);

  return (
    <AdminGuard>
      <AdminShell>
        <p className="text-xs tracking-wide text-terracotta mb-2">CONTENT</p>
        <h1 className="font-display text-3xl mb-8">Edit event</h1>
        {festival === undefined && <p className="text-muted">Loading…</p>}
        {festival === null && <p className="text-muted">Event not found.</p>}
        {festival && <EventForm mode="edit" initialDestinationSlug={destSlug} initial={festival} />}
      </AdminShell>
    </AdminGuard>
  );
}
