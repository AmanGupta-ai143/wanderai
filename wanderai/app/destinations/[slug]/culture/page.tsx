import Image from "next/image";
import { notFound } from "next/navigation";
import { getDestinationBySlug } from "@/lib/server/repository";
import StickyDestinationNav from "@/components/StickyDestinationNav";

export const dynamic = "force-dynamic";


export default async function CulturePage({
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
        <p className="text-xs tracking-wide text-terracotta mb-3">CULTURE</p>
        <h1 className="font-display text-4xl md:text-5xl mb-4">
          {destination.name}, culture &amp; soul
        </h1>
        <p className="text-muted max-w-xl leading-relaxed mb-14">
          The music, movement, craft and ritual that make {destination.name} feel like itself.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
          {destination.culture.map((c) => (
            <article key={c.slug}>
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
                <Image
                  src={c.image}
                  alt={c.title}
                  fill
                  sizes="(min-width: 1024px) 30vw, 90vw"
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <p className="text-xs tracking-wide text-gold mt-4">{c.category.toUpperCase()}</p>
              <h2 className="font-display text-2xl mt-1.5">{c.title}</h2>
              <p className="text-muted leading-relaxed mt-2.5 text-[15px]">{c.description}</p>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
