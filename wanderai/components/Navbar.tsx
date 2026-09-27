"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Search, Heart, CircleUserRound, Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/lib/client/AuthProvider";

const LINKS = [
  { href: "/search", label: "Explore" },
  { href: "/destinations", label: "Destinations" },
  { href: "/map", label: "Map" },
  { href: "/trip-planner", label: "Trip Planner" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const transparentCapable = pathname === "/";
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || !transparentCapable || open;
  const iconClass = solid ? "text-ink/80 hover:text-terracotta" : "text-paper/90 hover:text-paper";

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        solid
          ? "bg-paper/95 backdrop-blur-sm border-b border-ink/10"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10 h-18 flex items-center justify-between py-4">
        <Link
          href="/"
          className={`font-display text-xl tracking-wide ${solid ? "text-ink" : "text-paper"}`}
        >
          WanderAI
        </Link>

        <nav className="hidden md:flex items-center gap-9">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                solid ? "text-ink/80 hover:text-terracotta" : "text-paper/90 hover:text-paper"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-5">
          <Link href="/search" aria-label="Search" className={iconClass}>
            <Search size={19} strokeWidth={1.75} />
          </Link>
          <Link href="/wishlist" aria-label="Wishlist" className={iconClass}>
            <Heart size={19} strokeWidth={1.75} />
          </Link>

          {user ? (
            <div className="flex items-center gap-4">
              {user.role === "ADMIN" && (
                <Link href="/admin" className={`text-sm font-medium ${iconClass}`}>
                  Admin
                </Link>
              )}
              <Link href="/dashboard" className={`flex items-center gap-2 text-sm font-medium ${iconClass}`}>
                <CircleUserRound size={19} strokeWidth={1.75} />
                {user.name.split(" ")[0]}
              </Link>
              <button onClick={logout} aria-label="Sign out" className={iconClass}>
                <LogOut size={17} strokeWidth={1.75} />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className={`text-sm font-medium rounded-full px-4 py-2 transition-colors ${
                solid ? "bg-ink text-paper hover:bg-ink/90" : "bg-paper text-ink hover:bg-paper/90"
              }`}
            >
              Sign in
            </Link>
          )}
        </div>

        <button
          className={`md:hidden ${solid ? "text-ink" : "text-paper"}`}
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden bg-paper border-t border-ink/10 px-6 py-5 flex flex-col gap-4">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-ink text-base font-medium"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-6 pt-2 border-t border-ink/10 mt-1">
            <Link href="/wishlist" onClick={() => setOpen(false)} className="text-ink/80 flex items-center gap-2 text-sm">
              <Heart size={18} /> Wishlist
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)} className="text-ink/80 flex items-center gap-2 text-sm">
                  <CircleUserRound size={18} /> Account
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="text-ink/80 flex items-center gap-2 text-sm"
                >
                  <LogOut size={18} /> Sign out
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)} className="text-ink/80 flex items-center gap-2 text-sm">
                <CircleUserRound size={18} /> Sign in
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
