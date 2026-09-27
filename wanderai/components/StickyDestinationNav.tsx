"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function StickyDestinationNav({ slug }: { slug: string }) {
  const pathname = usePathname();
  const base = `/destinations/${slug}`;

  const items = [
    { href: base, label: "Overview" },
    { href: `${base}#places`, label: "Places" },
    { href: `${base}/history`, label: "History" },
    { href: `${base}/culture`, label: "Culture" },
    { href: `${base}/food`, label: "Food" },
    { href: `${base}/language`, label: "Language" },
    { href: `${base}/how-to-reach`, label: "How to Reach" },
    { href: `${base}/hotels`, label: "Hotels" },
    { href: `${base}/restaurants`, label: "Restaurants" },
    { href: `${base}/weather`, label: "Weather" },
    { href: `${base}/best-time`, label: "Best Time" },
    { href: `${base}/festivals`, label: "Festivals" },
    { href: `${base}/shopping`, label: "Shopping" },
    { href: `${base}/safety`, label: "Safety" },
    { href: `${base}/gallery`, label: "Gallery" },
  ];

  return (
    <div className="sticky top-16 z-30 bg-paper/95 backdrop-blur border-b border-ink/10">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <nav className="rail flex gap-7 overflow-x-auto py-4 text-sm">
          {items.map((item) => {
            const active = pathname === item.href.split("#")[0];
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`whitespace-nowrap pb-1 border-b-2 transition-colors ${
                  active
                    ? "border-terracotta text-ink font-medium"
                    : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
