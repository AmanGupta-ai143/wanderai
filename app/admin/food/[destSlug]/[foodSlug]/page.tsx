"use client";

import { use, useEffect, useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import FoodForm from "@/components/admin/FoodForm";
import { FoodItem } from "@/lib/types";

export default function EditFoodPage({
  params,
}: {
  params: Promise<{ destSlug: string; foodSlug: string }>;
}) {
  const { destSlug, foodSlug } = use(params);
  const [food, setFood] = useState<FoodItem | null | undefined>(undefined);

  useEffect(() => {
    fetch(`/api/destinations/${destSlug}/food`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setFood(d?.food?.find((f: FoodItem) => f.slug === foodSlug) ?? null));
  }, [destSlug, foodSlug]);

  return (
    <AdminGuard>
      <AdminShell>
        <p className="text-xs tracking-wide text-terracotta mb-2">CONTENT</p>
        <h1 className="font-display text-3xl mb-8">Edit food item</h1>
        {food === undefined && <p className="text-muted">Loading…</p>}
        {food === null && <p className="text-muted">Food item not found.</p>}
        {food && <FoodForm mode="edit" initialDestinationSlug={destSlug} initial={food} />}
      </AdminShell>
    </AdminGuard>
  );
}
