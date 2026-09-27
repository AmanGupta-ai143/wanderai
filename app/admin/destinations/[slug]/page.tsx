"use client";

import { use, useEffect, useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import DestinationForm from "@/components/admin/DestinationForm";
import { Destination } from "@/lib/types";

export default function EditDestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [destination, setDestination] = useState<Destination | null | undefined>(undefined);

  useEffect(() => {
    fetch(`/api/destinations/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setDestination(d?.destination ?? null));
  }, [slug]);

  return (
    <AdminGuard>
      <AdminShell>
        <p className="text-xs tracking-wide text-terracotta mb-2">CONTENT</p>
        <h1 className="font-display text-3xl mb-8">Edit destination</h1>
        {destination === undefined && <p className="text-muted">Loading…</p>}
        {destination === null && <p className="text-muted">Destination not found.</p>}
        {destination && <DestinationForm mode="edit" initial={destination} />}
      </AdminShell>
    </AdminGuard>
  );
}
