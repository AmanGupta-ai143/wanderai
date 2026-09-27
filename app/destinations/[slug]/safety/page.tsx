import { notFound } from "next/navigation";
import { Siren, Ambulance, Flame, CheckCircle2 } from "lucide-react";
import { getDestinationBySlug } from "@/lib/server/repository";
import StickyDestinationNav from "@/components/StickyDestinationNav";

export const dynamic = "force-dynamic";


export default async function SafetyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) notFound();
  const { safety } = destination;

  const EMERGENCY = [
    { label: "Police", number: safety.emergency.police, icon: Siren },
    { label: "Ambulance", number: safety.emergency.ambulance, icon: Ambulance },
    { label: "Fire", number: safety.emergency.fire, icon: Flame },
  ];

  return (
    <>
      <div className="pt-24" />
      <StickyDestinationNav slug={destination.slug} />

      <div className="mx-auto max-w-3xl px-6 lg:px-10 py-14 md:py-20">
        <p className="text-xs tracking-wide text-terracotta mb-3">TRAVEL SMART</p>
        <h1 className="font-display text-4xl md:text-5xl mb-10">
          Safety in {destination.name}
        </h1>

        <div className="grid grid-cols-3 gap-4 mb-12">
          {EMERGENCY.map(({ label, number, icon: Icon }) => (
            <div key={label} className="rounded-2xl bg-sand/60 p-5 text-center">
              <Icon size={20} className="mx-auto text-terracotta mb-2" strokeWidth={1.5} />
              <p className="font-display text-xl">{number}</p>
              <p className="text-xs text-muted mt-1">{label}</p>
            </div>
          ))}
        </div>

        <h2 className="font-display text-2xl mb-5">Good to know</h2>
        <ul className="space-y-3">
          {safety.tips.map((tip) => (
            <li key={tip} className="flex items-start gap-3 text-ink/80">
              <CheckCircle2 size={17} className="text-olive shrink-0 mt-0.5" strokeWidth={1.75} />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
