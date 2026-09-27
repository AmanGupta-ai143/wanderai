"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Map, Sparkles, CircleUserRound } from "lucide-react";
import { useAuth } from "@/lib/client/AuthProvider";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const items = [
    { href: "/", label: "Home", icon: Home },
    { href: "/search", label: "Explore", icon: Search },
    { href: "/map", label: "Map", icon: Map },
    { href: "/trip-planner", label: "AI", icon: Sparkles, highlight: true },
    { href: user ? "/dashboard" : "/login", label: "Profile", icon: CircleUserRound },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-paper border-t border-ink/10 flex items-stretch">
      {items.map(({ href, label, icon: Icon, highlight }) => {
        const active = pathname === href;
        return (
          <Link
            key={label}
            href={href}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5"
          >
            <span
              className={`grid place-items-center transition-colors ${
                highlight
                  ? "w-9 h-9 rounded-full bg-terracotta text-paper -mt-4 shadow-lg"
                  : active
                  ? "text-terracotta"
                  : "text-ink/50"
              }`}
            >
              <Icon size={highlight ? 18 : 19} strokeWidth={1.75} />
            </span>
            <span className={`text-[10px] ${active && !highlight ? "text-terracotta" : "text-ink/50"}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
