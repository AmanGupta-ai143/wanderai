import { notFound } from "next/navigation";
import { getDestinationBySlug } from "@/lib/server/repository";
import StickyDestinationNav from "@/components/StickyDestinationNav";
import HotelsClient from "@/components/destination/HotelsClient";

export const dynamic = "force-dynamic";

export default async function HotelsPage({
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
      <HotelsClient
        destinationName={destination.name}
        destinationSlug={destination.slug}
        hotels={destination.hotels}
      />
    </>
  );
}
