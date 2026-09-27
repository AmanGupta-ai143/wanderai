"use client";

import { useState } from "react";
import { Volume2 } from "lucide-react";
import { LanguageGuide } from "@/lib/types";

export default function LanguageGuideClient({
  destinationName,
  languageGuide,
}: {
  destinationName: string;
  languageGuide: LanguageGuide;
}) {
  const [speaking, setSpeaking] = useState<string | null>(null);

  function speak(text: string, id: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hi-IN";
    utterance.rate = 0.85;
    utterance.onstart = () => setSpeaking(id);
    utterance.onend = () => setSpeaking(null);
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 lg:px-10 py-14 md:py-20">
      <p className="text-xs tracking-wide text-terracotta mb-3">LANGUAGE GUIDE</p>
      <h1 className="font-display text-4xl md:text-5xl mb-6">Speak a little {destinationName}</h1>

      <div className="flex flex-wrap gap-6 mb-12 text-sm">
        <div>
          <p className="text-muted mb-1">Primary</p>
          <p className="font-medium">{languageGuide.primary}</p>
        </div>
        <div>
          <p className="text-muted mb-1">Also common</p>
          <p className="font-medium">{languageGuide.alsoCommon.join(", ")}</p>
        </div>
      </div>

      <h2 className="font-display text-2xl mb-5">Useful phrases</h2>
      <p className="text-xs text-muted mb-6">Tap the speaker to hear it out loud.</p>

      <div className="grid sm:grid-cols-2 gap-4">
        {languageGuide.phrases.map((p) => (
          <button
            key={p.phrase}
            onClick={() => speak(p.phrase, p.phrase)}
            className="text-left rounded-2xl border border-ink/10 bg-white p-5 hover:border-terracotta/40 transition-colors"
          >
            <p className="text-xs text-muted mb-1.5">{p.translation}</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display text-xl">{p.phrase}</p>
                <p className="text-xs text-muted mt-0.5">/{p.phonetic}/</p>
              </div>
              <Volume2
                size={18}
                className={speaking === p.phrase ? "text-terracotta animate-pulse" : "text-ink/40"}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
