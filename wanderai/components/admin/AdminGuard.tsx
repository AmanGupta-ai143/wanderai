"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/client/AuthProvider";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="pt-32 text-center text-muted">Loading…</div>;

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="pt-32 pb-24 text-center px-6">
        <ShieldAlert size={26} className="mx-auto text-muted mb-4" strokeWidth={1.5} />
        <h1 className="font-display text-3xl mb-3">Admin access required</h1>
        <p className="text-muted mb-6">
          Sign in with an admin account to manage WanderAI content.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-full bg-terracotta text-paper text-sm font-medium px-6 py-3 hover:bg-terracotta/90 transition-colors"
        >
          Sign in
        </Link>
        <p className="text-xs text-muted mt-4">Demo admin — admin@wanderai.app / admin123</p>
      </div>
    );
  }

  return <>{children}</>;
}
