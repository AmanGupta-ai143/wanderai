import { notFound } from "next/navigation";
import { Sun, Cloud, CloudRain, CloudSun, Droplets, Wind } from "lucide-react";
import { getDestinationBySlug } from "@/lib/server/repository";
import StickyDestinationNav from "@/components/StickyDestinationNav";
import { WeatherForecastDay } from "@/lib/types";

export const dynamic = "force-dynamic";


const CONDITION_ICON: Record<WeatherForecastDay["condition"], typeof Sun> = {
  Sunny: Sun,
  "Partly Cloudy": CloudSun,
  Cloudy: Cloud,
  Rainy: CloudRain,
};

export default async function WeatherPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) notFound();
  const { weather } = destination;
  const CurrentIcon = CONDITION_ICON[weather.condition];

  return (
    <>
      <div className="pt-24" />
      <StickyDestinationNav slug={destination.slug} />

      <div className="mx-auto max-w-3xl px-6 lg:px-10 py-14 md:py-20">
        <p className="text-xs tracking-wide text-terracotta mb-3">WEATHER</p>
        <h1 className="font-display text-4xl md:text-5xl mb-2">{destination.name} weather</h1>
        <p className="text-xs text-muted mb-12">
          Illustrative data — connect a live weather API for real-time forecasts.
        </p>

        <div className="rounded-3xl bg-ink text-paper p-8 md:p-10 text-center mb-10">
          <CurrentIcon size={40} className="mx-auto text-gold mb-4" strokeWidth={1.5} />
          <p className="font-display text-6xl">{weather.tempC}°C</p>
          <p className="text-paper/60 mt-2">Feels like {weather.feelsLikeC}°C</p>
          <div className="flex items-center justify-center gap-8 mt-6 text-sm text-paper/75">
            <span className="flex items-center gap-1.5">
              <Droplets size={14} /> {weather.humidity}%
            </span>
            <span className="flex items-center gap-1.5">
              <Wind size={14} /> {weather.windKmh} km/h
            </span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {weather.forecast.map((f) => {
            const Icon = CONDITION_ICON[f.condition];
            return (
              <div
                key={f.label}
                className="rounded-2xl border border-ink/10 bg-white p-4 text-center"
              >
                <p className="text-xs text-muted mb-2">{f.label}</p>
                <Icon size={20} className="mx-auto text-terracotta mb-2" strokeWidth={1.5} />
                <p className="font-display text-lg">{f.tempC}°</p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
