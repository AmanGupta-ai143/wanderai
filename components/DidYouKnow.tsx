"use client";

import { useState } from "react";
import { Lightbulb, ChevronLeft, ChevronRight } from "lucide-react";

export default function DidYouKnow({ facts }: { facts: string[] }) {
  const [i, setI] = useState(0);

  return (
    <div className="rounded-2xl bg-olive text-paper p-8 md:p-10 max-w-lg">
      <Lightbulb size={24} className="text-gold" strokeWidth={1.5} />
      <p className="text-xs tracking-wide text-paper/60 mt-5">DID YOU KNOW?</p>
      <p className="font-display text-xl md:text-2xl leading-snug mt-3 min-h-[5.5rem]">
        {facts[i]}
      </p>
      <div className="flex items-center justify-between mt-6">
        <span className="text-xs text-paper/50">
          {String(i + 1).padStart(2, "0")} / {String(facts.length).padStart(2, "0")}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setI((v) => (v - 1 + facts.length) % facts.length)}
            className="w-8 h-8 rounded-full border border-paper/30 grid place-items-center hover:bg-paper/10 transition-colors"
            aria-label="Previous fact"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={() => setI((v) => (v + 1) % facts.length)}
            className="w-8 h-8 rounded-full border border-paper/30 grid place-items-center hover:bg-paper/10 transition-colors"
            aria-label="Next fact"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
