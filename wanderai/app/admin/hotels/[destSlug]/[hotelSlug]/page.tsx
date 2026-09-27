"use client";

import { use, useEffect, useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import HotelForm from "@/components/admin/HotelForm";
import { Hotel } from "@/lib/types";

export default function EditHotelPage({
  params,
}: {
  params: Promise<{ destSlug: string; hotelSlug: string }>;
}) {
  const { destSlug, hotelSlug } = use(params);
  const [hotel, setHotel] = useState<Hotel | null | undefined>(undefined);

  useEffect(() => {
    fetch(`/api/destinations/${destSlug}/hotels`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setHotel(d?.hotels?.find((h: Hotel) => h.slug === hotelSlug) ?? null));
  }, [destSlug, hotelSlug]);

  return (
    <AdminGuard>
      <AdminShell>
        <p className="text-xs tracking-wide text-terracotta mb-2">CONTENT</p>
        <h1 className="font-display text-3xl mb-8">Edit hotel</h1>
        {hotel === undefined && <p className="text-muted">Loading…</p>}
        {hotel === null && <p className="text-muted">Hotel not found.</p>}
        {hotel && <HotelForm mode="edit" initialDestinationSlug={destSlug} initial={hotel} />}
      </AdminShell>
    </AdminGuard>
  );
}
