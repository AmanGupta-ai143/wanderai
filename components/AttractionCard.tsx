import Image from "next/image";
import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";
import { Attraction } from "@/lib/types";

export default function AttractionCard({
  attraction,
  destSlug,
}: {
  attraction: Attraction;
  destSlug: string;
}) {
  return (
    <Link
      href={`/destinations/${destSlug}/attractions/${attraction.slug}`}
      className="group block"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
        <Image
          src={attraction.image}
          alt={attraction.name}
          fill
          sizes="(min-width: 1024px) 32vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.08]"
        />
        <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/25 transition-colors" />
        <span className="absolute inset-0 flex items-center justify-center text-paper text-sm font-medium gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          Explore place <ArrowRight size={15} />
        </span>
      </div>
      <div className="mt-3.5 flex items-start justify-between">
        <div>
          <h3 className="font-display text-lg">{attraction.name}</h3>
          <p className="text-sm text-muted mt-0.5">{attraction.category}</p>
        </div>
        <div className="flex items-center gap-1 text-sm text-ink/80 shrink-0 mt-1">
          <Star size={13} className="fill-gold text-gold" strokeWidth={0} />
          {attraction.rating}
        </div>
      </div>
    </Link>
  );
}
