import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AIBanner() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-ink px-6 py-16 md:py-24 text-center">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, var(--color-gold), transparent 45%), radial-gradient(circle at 80% 80%, var(--color-terracotta), transparent 45%)",
        }}
      />
      <div className="relative max-w-2xl mx-auto">
        <Sparkles className="mx-auto text-gold" size={26} strokeWidth={1.5} />
        <h2 className="font-display text-3xl md:text-4xl text-paper mt-5">
          Don&apos;t know where to go?
        </h2>
        <p className="text-paper/65 mt-4 text-base md:text-lg">
          Tell us the kind of journey you want, and we&apos;ll find the destination that fits.
        </p>
        <Link
          href="/ai-recommender"
          className="inline-block mt-8 rounded-full bg-gold text-ink text-sm font-medium px-7 py-3.5 hover:bg-gold/90 transition-colors"
        >
          Find My Destination
        </Link>
      </div>
    </section>
  );
}
