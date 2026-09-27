"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useAuth } from "@/lib/client/AuthProvider";

export default function SaveButton({ destinationSlug }: { destinationSlug: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    if (!user) {
      router.push("/login");
      return;
    }
    setSaving(true);
    try {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinationSlug }),
      });
      setSaved((s) => !s);
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={saving}
      className="flex items-center gap-2 rounded-full bg-paper text-ink text-sm font-medium px-5 py-3 hover:bg-paper/90 transition-colors"
    >
      <Heart size={15} className={saved ? "fill-terracotta text-terracotta" : ""} />
      {saved ? "Saved" : "Save"}
    </button>
  );
}
