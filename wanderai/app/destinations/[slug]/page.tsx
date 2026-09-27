import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Map, Sparkles, Star, ArrowRight } from "lucide-react";
import { getDestinationBySlug } from "@/lib/server/repository";
import QuickFacts from "@/components/QuickFacts";
import StickyDestinationNav from "@/components/StickyDestinationNav";
import AttractionsGrid from "@/components/AttractionsGrid";
import DidYouKnow from "@/components/DidYouKnow";
import SaveButton from "@/components/SaveButton";

export const dynamic = "force-dynamic";


export default async function DestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) notFound();

  return (
    <>
      {/* Hero */}
      <section className="relative h-[86vh] min-h-[560px] w-full">
        <Image src={destination.heroImage} alt={destination.name} fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-ink/40" />

        <div className="relative h-full flex flex-col justify-end px-6 lg:px-10 pb-14">
          <div className="mx-auto max-w-7xl w-full">
            <p className="text-gold text-sm tracking-wide mb-2">{destination.region}, {destination.country}</p>
            <h1 className="font-display text-paper text-5xl md:text-6xl">{destination.name}</h1>
            <p className="text-paper/80 text-lg mt-2">{destination.tagline}</p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-5 text-paper/90 text-sm">
              <span className="flex items-center gap-1.5">
                <Star size={14} className="fill-gold text-gold" strokeWidth={0} /> {destination.rating}
              </span>
              <span>{destination.tags[0]}</span>
              <span>Best: {destination.bestTime}</span>
            </div>

            <div className="flex flex-wrap gap-3 mt-7">
              <SaveButton destinationSlug={destination.slug} />
              <Link
                href="/map"
                className="flex items-center gap-2 rounded-full border border-paper/50 text-paper text-sm font-medium px-5 py-3 hover:bg-paper/10 transition-colors"
              >
                <Map size={15} /> Explore Map
              </Link>
              <Link
                href="/trip-planner"
                className="flex items-center gap-2 rounded-full bg-terracotta text-paper text-sm font-medium px-5 py-3 hover:bg-terracotta/90 transition-colors"
              >
                <Sparkles size={15} /> Plan My Trip
              </Link>
            </div>
          </div>
        </div>
      </section>

      <StickyDestinationNav slug={destination.slug} />

      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Quick facts */}
        <section className="py-14 md:py-16">
          <QuickFacts facts={destination.quickFacts} />
        </section>

        {/* Intro */}
        <section className="pb-16 md:pb-20 max-w-2xl">
          <h2 className="font-display text-3xl md:text-4xl mb-5">About {destination.name}</h2>
          <p className="text-muted leading-relaxed text-[17px]">{destination.intro}</p>
        </section>

        {/* Places to visit */}
        <section id="places" className="pb-20 md:pb-28 scroll-mt-32">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl md:text-4xl">Must-see places</h2>
              <p className="text-muted mt-3 max-w-md">
                The stories behind {destination.name}&apos;s most iconic places.
              </p>
            </div>
            <Link
              href="/map"
              className="hidden sm:flex items-center gap-1.5 text-sm text-terracotta font-medium shrink-0"
            >
              View on map <ArrowRight size={14} />
            </Link>
          </div>
          <AttractionsGrid attractions={destination.attractions} destSlug={destination.slug} />
        </section>

        {/* History + Did you know */}
        <section className="pb-20 md:pb-28 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs tracking-wide text-terracotta mb-3">A CITY WITH A STORY</p>
            <h2 className="font-display text-3xl md:text-4xl mb-5">
              The history of {destination.name}
            </h2>
            <p className="text-muted leading-relaxed mb-7 max-w-md">
              From its founding to the present day — explore the timeline of events that shaped
              this city.
            </p>
            <Link
              href={`/destinations/${destination.slug}/history`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink border-b border-ink/30 pb-0.5 hover:border-terracotta hover:text-terracotta transition-colors"
            >
              Read the full story <ArrowRight size={14} />
            </Link>
          </div>
          <DidYouKnow facts={destination.didYouKnow} />
        </section>

        {/* Culture teaser */}
        <section className="pb-20 md:pb-28">
          <div className="flex items-end justify-between mb-10">
            <h2 className="font-display text-3xl md:text-4xl">Culture &amp; soul</h2>
            <Link href={`/destinations/${destination.slug}/culture`} className="text-sm text-terracotta font-medium flex items-center gap-1.5">
              See all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {destination.culture.slice(0, 4).map((c) => (
              <Link
                key={c.slug}
                href={`/destinations/${destination.slug}/culture`}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden block"
              >
                <Image
                  src={c.image}
                  alt={c.title}
                  fill
                  sizes="(min-width: 1024px) 24vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
                <span className="absolute bottom-4 left-4 text-paper font-display text-lg">
                  {c.title}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Food teaser */}
        <section className="pb-24 md:pb-32">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl md:text-4xl">A taste of {destination.name}</h2>
              <p className="text-muted mt-3">Dishes worth crossing the city for.</p>
            </div>
            <Link href={`/destinations/${destination.slug}/food`} className="hidden sm:flex text-sm text-terracotta font-medium items-center gap-1.5">
              See all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="rail flex gap-5 overflow-x-auto pb-3">
            {destination.food.map((f) => (
              <Link
                key={f.slug}
                href={`/destinations/${destination.slug}/food`}
                className="group shrink-0 w-64"
              >
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                  <Image
                    src={f.image}
                    alt={f.name}
                    fill
                    sizes="256px"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <h3 className="font-display text-lg mt-3">{f.name}</h3>
                <p className="text-sm text-muted mt-0.5">{f.origin}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
