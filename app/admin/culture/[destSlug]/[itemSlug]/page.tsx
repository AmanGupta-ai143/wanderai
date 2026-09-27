"use client";

import { use, useEffect, useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import CultureForm from "@/components/admin/CultureForm";
import { CultureItem } from "@/lib/types";

export default function EditCulturePage({
  params,
}: {
  params: Promise<{ destSlug: string; itemSlug: string }>;
}) {
  const { destSlug, itemSlug } = use(params);
  const [item, setItem] = useState<CultureItem | null | undefined>(undefined);

  useEffect(() => {
    fetch(`/api/destinations/${destSlug}/culture`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setItem(d?.culture?.find((c: CultureItem) => c.slug === itemSlug) ?? null));
  }, [destSlug, itemSlug]);

  return (
    <AdminGuard>
      <AdminShell>
        <p className="text-xs tracking-wide text-terracotta mb-2">CONTENT</p>
        <h1 className="font-display text-3xl mb-8">Edit culture item</h1>
        {item === undefined && <p className="text-muted">Loading…</p>}
        {item === null && <p className="text-muted">Culture item not found.</p>}
        {item && <CultureForm mode="edit" initialDestinationSlug={destSlug} initial={item} />}
      </AdminShell>
    </AdminGuard>
  );
}
