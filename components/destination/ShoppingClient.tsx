"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingItem } from "@/lib/types";

export default function ShoppingClient({ items }: { items: ShoppingItem[] }) {
  const [category, setCategory] = useState("All");
  const categories = ["All", ...Array.from(new Set(items.map((s) => s.category)))];
  const filtered = category === "All" ? items : items.filter((s) => s.category === category);

  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-10 py-14 md:py-20">
      <p className="text-xs tracking-wide text-terracotta mb-3">SHOPPING GUIDE</p>
      <h1 className="font-display text-4xl md:text-5xl mb-8">Shop like a local</h1>

      <div className="flex flex-wrap gap-2 mb-10">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`text-sm px-4 py-2 rounded-full transition-colors ${
              category === c ? "bg-ink text-paper" : "bg-sand text-ink/70 hover:bg-ink/10"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {filtered.map((s) => (
          <div key={s.item} className="rounded-2xl border border-ink/10 bg-white overflow-hidden">
            <div className="relative aspect-[16/9]">
              <Image src={s.image} alt={s.item} fill sizes="(min-width: 768px) 45vw, 90vw" className="object-cover" />
            </div>
            <div className="p-5">
              <p className="text-xs text-gold mb-1">{s.category.toUpperCase()}</p>
              <h2 className="font-display text-xl mb-2">{s.item}</h2>
              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                <div>
                  <p className="text-xs text-muted">Price range</p>
                  <p>{s.priceRange}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Where to buy</p>
                  <p>{s.whereToBuy}</p>
                </div>
              </div>
              <p className="text-xs text-ink/70 italic">💡 {s.bargainingTip}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
