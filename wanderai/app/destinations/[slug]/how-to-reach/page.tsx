import { notFound } from "next/navigation";
import { getDestinationBySlug } from "@/lib/server/repository";
import StickyDestinationNav from "@/components/StickyDestinationNav";
import HowToReachClient from "@/components/destination/HowToReachClient";

export const dynamic = "force-dynamic";

export default async function HowToReachPage({
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
      <HowToReachClient destinationName={destination.name} transport={destination.transport} />
    </>
  );
}
