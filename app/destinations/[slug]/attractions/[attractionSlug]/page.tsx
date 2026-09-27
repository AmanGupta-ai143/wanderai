import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Clock, Ticket, Sun, Star, ArrowLeft, Map } from "lucide-react";
import { getAttraction } from "@/lib/server/repository";
import ReviewsSection from "@/components/reviews/ReviewsSection";

export const dynamic = "force-dynamic";

export default async function AttractionPage({
  params,
}: {
  params: Promise<{ slug: string; attractionSlug: string }>;
}) {
  const { slug, attractionSlug } = await params;
  const result = await getAttraction(slug, attractionSlug);
  if (!result) notFound();
  const { dest, attraction } = result;

  const facts = [
    { icon: MapPin, label: "Location", value: attraction.location },
    { icon: Clock, label: "Duration", value: attraction.duration },
    { icon: Ticket, label: "Ticket", value: attraction.ticket },
    { icon: Sun, label: "Best time", value: attraction.bestTime },
  ];

  return (
    <div className="pt-20">
      <div className="mx-auto max-w-4xl px-6 lg:px-10 pt-8">
        <Link
          href={`/destinations/${dest.slug}#places`}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft size={14} /> Back to {dest.name}
        </Link>
      </div>

      <div className="mx-auto max-w-4xl px-6 lg:px-10 mt-6">
        <div className="relative aspect-[16/10] rounded-3xl overflow-hidden">
          <Image src={attraction.image} alt={attraction.name} fill priority className="object-cover" />
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 lg:px-10 py-12">
        <p className="text-xs tracking-wide text-terracotta mb-3">
          {attraction.category.toUpperCase()}
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl md:text-5xl">{attraction.name}</h1>
            <p className="text-muted mt-2">
              {dest.name}, {dest.region}
            </p>
          </div>
          <span className="flex items-center gap-1.5 text-ink/80 text-sm">
            <Star size={14} className="fill-gold text-gold" strokeWidth={0} /> {attraction.rating}
          </span>
        </div>

        <hr className="border-ink/10 my-10" />

        <section className="mb-10">
          <h2 className="font-display text-2xl mb-4">The story</h2>
          <p className="text-muted leading-relaxed text-[17px]">{attraction.about}</p>
        </section>

        <section className="mb-10 grid sm:grid-cols-2 gap-4">
          {facts.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl bg-sand/60 px-5 py-4 flex items-start gap-3.5">
              <Icon size={17} className="text-olive mt-0.5 shrink-0" strokeWidth={1.75} />
              <div>
                <p className="text-xs text-muted">{label}</p>
                <p className="text-[15px] mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </section>

        <hr className="border-ink/10 my-10" />

        <section className="mb-10">
          <h2 className="font-display text-2xl mb-4">Architecture</h2>
          <p className="text-muted leading-relaxed text-[17px]">{attraction.architecture}</p>
        </section>

        <hr className="border-ink/10 my-10" />

        <section>
          <h2 className="font-display text-2xl mb-4">Location</h2>
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-sand grid place-items-center">
            <div className="text-center text-muted">
              <Map size={24} className="mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-sm">Interactive map loads here</p>
            </div>
          </div>
          <Link
            href="/map"
            className="inline-flex items-center gap-2 mt-5 rounded-full bg-terracotta text-paper text-sm font-medium px-6 py-3 hover:bg-terracotta/90 transition-colors"
          >
            <Map size={15} /> Get Directions
          </Link>
        </section>

        <hr className="border-ink/10 my-10" />

        <ReviewsSection destSlug={dest.slug} attractionSlug={attraction.slug} />
      </div>
    </div>
  );
}
