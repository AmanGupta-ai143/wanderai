import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { getDestinationBySlug } from "@/lib/server/repository";
import StickyDestinationNav from "@/components/StickyDestinationNav";

export const dynamic = "force-dynamic";


export default async function FoodPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) notFound();

  return (
    <>
      <div className="pt-24" />
      <StickyDestinationNav slug={destination.slug} />

      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-14 md:py-20">
        <p className="text-xs tracking-wide text-terracotta mb-3">FOOD &amp; CUISINE</p>
        <h1 className="font-display text-4xl md:text-5xl mb-4">A taste of {destination.name}</h1>
        <p className="text-muted max-w-xl leading-relaxed mb-16">
          Five dishes that tell you everything about how this city eats.
        </p>

        <div className="space-y-20 md:space-y-28">
          {destination.food.map((f, i) => (
            <article
              key={f.slug}
              className={`grid md:grid-cols-2 gap-8 md:gap-14 items-center ${
                i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div className="relative aspect-[5/4] rounded-2xl overflow-hidden">
                <Image
                  src={f.image}
                  alt={f.name}
                  fill
                  sizes="(min-width: 768px) 45vw, 90vw"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-xs text-muted mb-2">{f.origin}</p>
                <h2 className="font-display text-3xl md:text-4xl mb-4">{f.name}</h2>
                <p className="text-muted leading-relaxed mb-6">{f.description}</p>

                <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm mb-6">
                  <div>
                    <dt className="text-xs text-gold mb-1">TASTE</dt>
                    <dd className="text-ink/85">{f.taste}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gold mb-1">KEY INGREDIENTS</dt>
                    <dd className="text-ink/85">{f.ingredients.join(", ")}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-xs text-gold mb-1">WHY IT MATTERS</dt>
                    <dd className="text-ink/85">{f.significance}</dd>
                  </div>
                </dl>

                <div className="flex items-center gap-2 text-sm text-terracotta font-medium">
                  <MapPin size={14} /> Best tried at: {f.whereToTry}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
