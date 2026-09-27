"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { GalleryImage } from "@/lib/types";

export default function GalleryMasonry({ images }: { images: GalleryImage[] }) {
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(images.map((i) => i.category)))],
    [images]
  );
  const [active, setActive] = useState("All");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = active === "All" ? images : images.filter((i) => i.category === active);

  return (
    <div>
      <div className="rail flex gap-2 overflow-x-auto pb-2 mb-8">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`shrink-0 text-sm px-4 py-2 rounded-full transition-colors ${
              active === c ? "bg-ink text-paper" : "bg-sand text-ink/70 hover:bg-ink/10"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="columns-2 md:columns-3 gap-4 [column-fill:_balance]">
        {filtered.map((img, i) => (
          <button
            key={img.image + i}
            onClick={() => setLightbox(i)}
            className={`relative w-full mb-4 block break-inside-avoid rounded-2xl overflow-hidden group ${
              img.tall ? "aspect-[3/4]" : "aspect-[4/3]"
            }`}
          >
            <Image
              src={img.image}
              alt={img.caption}
              fill
              sizes="(min-width: 1024px) 30vw, 45vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/20 transition-colors" />
          </button>
        ))}
      </div>

      {lightbox !== null && (
        <div className="fixed inset-0 z-[60] bg-ink/95 flex items-center justify-center px-4">
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-6 right-6 text-paper/80 hover:text-paper"
            aria-label="Close"
          >
            <X size={26} />
          </button>
          <button
            onClick={() => setLightbox((v) => (v! - 1 + filtered.length) % filtered.length)}
            className="absolute left-4 md:left-8 text-paper/70 hover:text-paper"
            aria-label="Previous image"
          >
            <ChevronLeft size={32} />
          </button>
          <div className="relative w-full max-w-3xl aspect-[4/3]">
            <Image
              src={filtered[lightbox].image}
              alt={filtered[lightbox].caption}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>
          <button
            onClick={() => setLightbox((v) => (v! + 1) % filtered.length)}
            className="absolute right-4 md:right-8 text-paper/70 hover:text-paper"
            aria-label="Next image"
          >
            <ChevronRight size={32} />
          </button>
          <p className="absolute bottom-8 text-paper/70 text-sm text-center w-full px-6">
            {filtered[lightbox].caption}
          </p>
        </div>
      )}
    </div>
  );
}
