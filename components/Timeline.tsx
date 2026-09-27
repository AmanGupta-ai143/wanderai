"use client";

import { useState } from "react";
import { HistoryEvent } from "@/lib/types";

export default function Timeline({ events }: { events: HistoryEvent[] }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="relative max-w-3xl">
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-ink/15" />
      <ol className="space-y-2">
        {events.map((event, i) => {
          const isOpen = open === i;
          return (
            <li key={event.year} className="relative pl-9">
              <span
                className={`absolute left-0 top-2 w-3.5 h-3.5 rounded-full border-2 transition-colors ${
                  isOpen ? "bg-terracotta border-terracotta" : "bg-paper border-ink/30"
                }`}
              />
              <button
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="w-full text-left py-4 group"
              >
                <span className="text-xs tracking-wide text-gold font-medium">{event.year}</span>
                <h3 className="font-display text-xl md:text-2xl mt-1 group-hover:text-terracotta transition-colors">
                  {event.title}
                </h3>
                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <p className="overflow-hidden text-muted leading-relaxed text-[15px] max-w-xl">
                    {event.description}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
