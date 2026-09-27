import { notFound } from "next/navigation";
import Image from "next/image";
import { getDestinationBySlug } from "@/lib/server/repository";
import StickyDestinationNav from "@/components/StickyDestinationNav";

export const dynamic = "force-dynamic";


export default async function FestivalsPage({
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

      <div className="mx-auto max-w-6xl px-6 lg:px-10 py-14 md:py-20">
        <p className="text-xs tracking-wide text-terracotta mb-3">FESTIVALS &amp; EVENTS</p>
        <h1 className="font-display text-4xl md:text-5xl mb-12">
          {destination.name}&apos;s calendar of celebration
        </h1>

        <div className="grid sm:grid-cols-2 gap-6">
          {destination.festivals.map((f) => (
            <div key={f.slug} className="group relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src={f.image}
                alt={f.name}
                fill
                sizes="(min-width: 768px) 45vw, 90vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-gold text-xs tracking-wide mb-1">{f.dateLabel.toUpperCase()}</p>
                <h2 className="font-display text-2xl text-paper mb-2">{f.name}</h2>
                <p className="text-paper/75 text-sm leading-relaxed max-w-sm">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
