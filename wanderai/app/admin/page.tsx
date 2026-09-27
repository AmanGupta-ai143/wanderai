"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Globe2, Landmark, Users, Star, Heart, Compass, ArrowRight } from "lucide-react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";

type Stats = {
  destinations: number;
  attractions: number;
  users: number;
  reviews: number;
  favorites: number;
  itineraries: number;
};

const CARDS: { key: keyof Stats; label: string; icon: typeof Globe2 }[] = [
  { key: "destinations", label: "Destinations", icon: Globe2 },
  { key: "attractions", label: "Attractions", icon: Landmark },
  { key: "users", label: "Users", icon: Users },
  { key: "reviews", label: "Reviews", icon: Star },
  { key: "favorites", label: "Saved places", icon: Heart },
  { key: "itineraries", label: "AI itineraries generated", icon: Compass },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  return (
    <AdminGuard>
      <AdminShell>
        <p className="text-xs tracking-wide text-terracotta mb-2">DASHBOARD</p>
        <h1 className="font-display text-3xl mb-8">Platform overview</h1>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {CARDS.map(({ key, label, icon: Icon }) => (
            <div key={key} className="rounded-2xl bg-white border border-ink/8 p-6">
              <Icon size={18} className="text-terracotta mb-3" strokeWidth={1.75} />
              <p className="font-display text-3xl">{stats ? stats[key] : "—"}</p>
              <p className="text-sm text-muted mt-1">{label}</p>
            </div>
          ))}
        </div>

        <Link
          href="/admin/destinations"
          className="inline-flex items-center gap-2 text-sm font-medium text-terracotta"
        >
          Manage destinations <ArrowRight size={14} />
        </Link>
      </AdminShell>
    </AdminGuard>
  );
}
