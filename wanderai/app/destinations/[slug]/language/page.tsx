import { notFound } from "next/navigation";
import { getDestinationBySlug } from "@/lib/server/repository";
import StickyDestinationNav from "@/components/StickyDestinationNav";
import LanguageGuideClient from "@/components/destination/LanguageGuideClient";

export const dynamic = "force-dynamic";

export default async function LanguagePage({
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
      <LanguageGuideClient destinationName={destination.name} languageGuide={destination.languageGuide} />
    </>
  );
}
