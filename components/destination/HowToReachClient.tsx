"use client";

import { useState } from "react";
import { Plane, TrainFront, Bus, Car } from "lucide-react";
import { TransportOption } from "@/lib/types";

const ICONS: Record<TransportOption["mode"], typeof Plane> = {
  Flight: Plane,
  Train: TrainFront,
  Bus: Bus,
  Car: Car,
};

export default function HowToReachClient({
  destinationName,
  transport,
}: {
  destinationName: string;
  transport: TransportOption[];
}) {
  const [from, setFrom] = useState("New Delhi");

  return (
    <div className="mx-auto max-w-4xl px-6 lg:px-10 py-14 md:py-20">
      <p className="text-xs tracking-wide text-terracotta mb-3">HOW TO REACH</p>
      <h1 className="font-display text-4xl md:text-5xl mb-8">Getting to {destinationName}</h1>

      <div className="flex items-center gap-3 mb-12">
        <label className="text-sm text-muted">Starting from</label>
        <input
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="border border-ink/15 rounded-full px-4 py-2 text-sm bg-paper"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {transport.map((t) => {
          const Icon = ICONS[t.mode];
          return (
            <div key={t.mode} className="rounded-2xl border border-ink/10 bg-white p-6">
              <div className="w-10 h-10 rounded-full bg-sand grid place-items-center mb-4">
                <Icon size={18} className="text-terracotta" strokeWidth={1.75} />
              </div>
              <h2 className="font-display text-xl mb-1">
                {t.mode} from {from || t.from}
              </h2>
              <p className="text-sm text-muted mb-4">{t.detail}</p>
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <p className="text-xs text-muted">Time</p>
                  <p className="font-medium">{t.approxTime}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Cost</p>
                  <p className="font-medium">{t.approxCost}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
