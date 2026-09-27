import Image from "next/image";
import Link from "next/link";
import { Sparkles, ChevronDown } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import ExperienceCard from "@/components/ExperienceCard";
import DestinationCard from "@/components/DestinationCard";
import AIBanner from "@/components/AIBanner";
import NightSky from "@/components/NightSky";
import { experiences } from "@/lib/mock-data";
import { listDestinations, getDestinationBySlug } from "@/lib/server/repository";

export const dynamic = "force-dynamic";

export default async function Home() {
  const destinations = await listDestinations();
  const jaipur = (await getDestinationBySlug("jaipur")) ?? destinations[0];
  const [featured, ...rest] = destinations;

  return (
    <>
      {/* Hero */}
      <section className="relative h-screen min-h-[640px] w-full">
        <Image
          src={jaipur.heroImage}
          alt="Amber Fort at golden hour"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/35 to-ink/70" />
        <NightSky />

        <div className="relative h-full flex flex-col items-center justify-center px-6 text-center">
          <h1 className="font-display text-paper text-5xl sm:text-6xl md:text-7xl leading-[1.05]">
            Discover
            <br />
            the world
          </h1>
          <p className="mt-6 text-paper/85 text-base md:text-lg max-w-md">
            Stories, places, people and experiences — an AI guide to everywhere you want to go.
          </p>

          <div className="mt-9 w-full flex justify-center px-4">
            <SearchBar />
          </div>

          <Link
            href="/trip-planner"
            className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-paper border border-paper/40 rounded-full px-5 py-2.5 hover:bg-paper/10 transition-colors"
          >
            <Sparkles size={15} /> Plan my trip with AI
          </Link>
        </div>

        <div className="absolute bottom-8 inset-x-0 flex flex-col items-center gap-1 text-paper/70 text-xs">
          Scroll to explore
          <ChevronDown size={16} className="animate-bounce" />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Experience categories */}
        <section className="py-20 md:py-28">
          <div className="max-w-lg">
            <h2 className="font-display text-3xl md:text-4xl">What are you looking for?</h2>
            <p className="text-muted mt-3">
              Every journey starts with a feeling. Pick the one that matches yours.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4">
            {experiences.map((exp) => (
              <ExperienceCard key={exp.label} {...exp} />
            ))}
          </div>
        </section>

        {/* Trending destinations */}
        <section className="pb-20 md:pb-28">
          <div className="flex items-end justify-between max-w-2xl">
            <div>
              <h2 className="font-display text-3xl md:text-4xl">Trending now</h2>
              <p className="text-muted mt-3">Destinations travelers are loving this season.</p>
            </div>
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-5">
            <div className="md:col-span-2 md:row-span-2">
              <DestinationCard destination={featured} size="large" />
            </div>
            {rest.map((d) => (
              <DestinationCard key={d.slug} destination={d} />
            ))}
          </div>
        </section>

        {/* AI discovery */}
        <section className="pb-24 md:pb-32">
          <AIBanner />
        </section>

        {/* Personalized (static teaser row) */}
        <section className="pb-24 md:pb-32">
          <h2 className="font-display text-3xl md:text-4xl mb-3">Picked for you</h2>
          <p className="text-muted mb-10 max-w-lg">
            Based on what travelers with similar interests have explored.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {destinations.map((d) => (
              <DestinationCard key={d.slug} destination={d} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
