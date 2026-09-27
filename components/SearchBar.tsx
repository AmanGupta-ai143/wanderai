"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

const POPULAR = [
  { name: "Jaipur", flag: "🇮🇳", slug: "jaipur" },
  { name: "Goa", flag: "🇮🇳", slug: "goa" },
  { name: "Varanasi", flag: "🇮🇳", slug: "varanasi" },
  { name: "Manali", flag: "🇮🇳", slug: "manali" },
];

export default function SearchBar({ variant = "hero" }: { variant?: "hero" | "compact" }) {
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  function go(slug?: string) {
    router.push(`/search?q=${encodeURIComponent(slug ?? query)}`);
  }

  return (
    <div className="relative w-full max-w-xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go();
        }}
        className={`flex items-center gap-3 rounded-full bg-paper/95 backdrop-blur px-5 shadow-[0_12px_40px_-12px_rgba(23,33,29,0.35)] ${
          variant === "hero" ? "h-14" : "h-12"
        }`}
      >
        <Search size={18} className="text-muted shrink-0" strokeWidth={2} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder='Where do you want to go? Try "Jaipur", "Paris"...'
          className="flex-1 bg-transparent outline-none text-ink placeholder:text-muted text-sm md:text-[15px]"
        />
        <button
          type="submit"
          className="hidden sm:block text-xs font-medium text-paper bg-terracotta hover:bg-terracotta/90 transition-colors rounded-full px-4 py-2"
        >
          Search
        </button>
      </form>

      {focused && (
        <div className="absolute top-full mt-2 w-full rounded-2xl bg-paper shadow-xl border border-ink/10 p-4 text-left">
          <p className="text-xs text-muted mb-3">Popular searches</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR.map((p) => (
              <button
                key={p.slug}
                onMouseDown={() => go(p.slug)}
                className="text-sm px-3 py-1.5 rounded-full bg-sand text-ink hover:bg-terracotta hover:text-paper transition-colors"
              >
                {p.flag} {p.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
