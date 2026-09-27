import Link from "next/link";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Explore",
    links: [
      { label: "Destinations", href: "/destinations" },
      { label: "Places", href: "/search" },
      { label: "Food", href: "#" },
      { label: "Culture", href: "#" },
      { label: "Map", href: "/map" },
    ],
  },
  {
    title: "Plan",
    links: [
      { label: "AI Trip Planner", href: "/trip-planner" },
      { label: "Budget Calculator", href: "/budget-calculator" },
      { label: "Itineraries", href: "/dashboard" },
      { label: "Packing List", href: "/packing-list" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-paper/90">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <p className="font-display text-2xl text-paper">WanderAI</p>
          <p className="mt-3 text-sm text-paper/60 leading-relaxed max-w-[22ch]">
            Explore the world, one destination at a time.
          </p>
          <div className="mt-6 flex gap-4 text-xs text-paper/50">
            <span>Instagram</span>
            <span>YouTube</span>
            <span>X</span>
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-xs tracking-wide text-gold/90 mb-4">{col.title}</p>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-paper/70 hover:text-paper transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-paper/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-5 text-xs text-paper/40">
          © 2026 WanderAI
        </div>
      </div>
    </footer>
  );
}
