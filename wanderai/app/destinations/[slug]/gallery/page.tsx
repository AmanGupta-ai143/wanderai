import { notFound } from "next/navigation";
import { getDestinationBySlug } from "@/lib/server/repository";
import StickyDestinationNav from "@/components/StickyDestinationNav";
import GalleryMasonry from "@/components/GalleryMasonry";

export const dynamic = "force-dynamic";


export default async function GalleryPage({
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
        <p className="text-xs tracking-wide text-terracotta mb-3">GALLERY</p>
        <h1 className="font-display text-4xl md:text-5xl mb-4">
          {destination.name}, through a lens
        </h1>
        <p className="text-muted max-w-xl leading-relaxed mb-12">
          A visual walk through architecture, food, culture and everyday life.
        </p>

        <GalleryMasonry images={destination.gallery} />
      </div>
    </>
  );
}
