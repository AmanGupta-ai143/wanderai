"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Globe2,
  Landmark,
  UtensilsCrossed,
  Drama,
  Hotel,
  Image as ImageIcon,
  CalendarDays,
  Star,
  Users,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, live: true },
  { href: "/admin/destinations", label: "Destinations", icon: Globe2, live: true },
  { href: "/admin/attractions", label: "Attractions", icon: Landmark, live: true },
  { href: "/admin/food", label: "Food", icon: UtensilsCrossed, live: true },
  { href: "/admin/culture", label: "Culture", icon: Drama, live: true },
  { href: "/admin/hotels", label: "Hotels", icon: Hotel, live: true },
  { href: "/admin/gallery", label: "Images", icon: ImageIcon, live: true },
  { href: "/admin/events", label: "Events", icon: CalendarDays, live: true },
  { href: "/admin/reviews", label: "Reviews", icon: Star, live: true },
  { href: "/admin/users", label: "Users", icon: Users, live: true },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="pt-16 min-h-screen grid md:grid-cols-[240px_1fr] bg-sand/30">
      <aside className="border-r border-ink/10 bg-paper p-5 md:min-h-[calc(100vh-4rem)]">
        <p className="font-display text-lg mb-1">WanderAI</p>
        <p className="text-xs text-terracotta tracking-wide mb-6">ADMIN</p>
        <nav className="space-y-1">
          {NAV.map(({ href, label, icon: Icon, live }) => {
            const active = live && pathname === href;
            return (
              <Link
                key={label}
                href={live ? href : "#"}
                aria-disabled={!live}
                className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-ink text-paper"
                    : live
                    ? "text-ink/80 hover:bg-sand"
                    : "text-ink/30 cursor-not-allowed"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={16} strokeWidth={1.75} />
                  {label}
                </span>
                {!live && <span className="text-[10px]">soon</span>}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="p-6 md:p-10">{children}</div>
    </div>
  );
}
