import { notFound } from "next/navigation";
import { getDestinationBySlug } from "@/lib/server/repository";
import StickyDestinationNav from "@/components/StickyDestinationNav";
import Timeline from "@/components/Timeline";
import DidYouKnow from "@/components/DidYouKnow";

export const dynamic = "force-dynamic";


export default async function HistoryPage({
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
        <p className="text-xs tracking-wide text-terracotta mb-3">HISTORY</p>
        <h1 className="font-display text-4xl md:text-5xl mb-4">
          The story of {destination.name}
        </h1>
        <p className="text-muted max-w-xl leading-relaxed mb-14">
          Three centuries, told through the moments that shaped the city.
        </p>

        <div className="grid lg:grid-cols-[1fr_360px] gap-14 items-start">
          <Timeline events={destination.history} />
          <div className="lg:sticky lg:top-40">
            <DidYouKnow facts={destination.didYouKnow} />
          </div>
        </div>
      </div>
    </>
  );
}
