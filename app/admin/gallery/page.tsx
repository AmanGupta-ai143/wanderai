"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import { Destination, GalleryImage } from "@/lib/types";

export default function AdminGalleryPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [destSlug, setDestSlug] = useState("");
  const [gallery, setGallery] = useState<GalleryImage[] | null>(null);

  const [image, setImage] = useState("");
  const [category, setCategory] = useState("");
  const [caption, setCaption] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/destinations")
      .then((r) => r.json())
      .then((d) => {
        const list: Destination[] = d.destinations ?? [];
        setDestinations(list);
        setDestSlug((s) => s || list[0]?.slug || "");
      });
  }, []);

  function loadGallery(slug: string) {
    if (!slug) return;
    fetch(`/api/destinations/${slug}/gallery`)
      .then((r) => r.json())
      .then((d) => setGallery(d.gallery ?? []));
  }

  useEffect(() => {
    loadGallery(destSlug);
  }, [destSlug]);

  async function addImage(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/destinations/${destSlug}/gallery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image, category, caption }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Couldn't add image");
      return;
    }
    setImage("");
    setCategory("");
    setCaption("");
    loadGallery(destSlug);
  }

  async function removeImage(index: number) {
    if (!confirm("Delete this image? This can't be undone.")) return;
    setDeleting(index);
    await fetch(`/api/destinations/${destSlug}/gallery/${index}`, { method: "DELETE" });
    setDeleting(null);
    loadGallery(destSlug);
  }

  return (
    <AdminGuard>
      <AdminShell>
        <p className="text-xs tracking-wide text-terracotta mb-2">CONTENT</p>
        <h1 className="font-display text-3xl mb-8">Media library</h1>

        <label className="block text-sm text-muted mb-2">Destination</label>
        <select
          value={destSlug}
          onChange={(e) => setDestSlug(e.target.value)}
          className="mb-8 border border-ink/15 rounded-xl px-4 py-2.5 text-sm bg-paper"
        >
          {destinations.map((d) => (
            <option key={d.slug} value={d.slug}>
              {d.name}
            </option>
          ))}
        </select>

        <form onSubmit={addImage} className="rounded-2xl bg-white border border-ink/8 p-6 mb-10 grid sm:grid-cols-4 gap-4 items-end">
          <label className="block sm:col-span-2">
            <span className="block text-xs text-muted mb-1.5">Image URL</span>
            <input
              required
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full border border-ink/15 rounded-lg px-3 py-2 text-sm bg-paper"
            />
          </label>
          <label className="block">
            <span className="block text-xs text-muted mb-1.5">Category</span>
            <input
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Food, Culture…"
              className="w-full border border-ink/15 rounded-lg px-3 py-2 text-sm bg-paper"
            />
          </label>
          <label className="block">
            <span className="block text-xs text-muted mb-1.5">Caption</span>
            <input
              required
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full border border-ink/15 rounded-lg px-3 py-2 text-sm bg-paper"
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="sm:col-span-4 flex items-center justify-center gap-2 rounded-full bg-terracotta text-paper text-sm font-medium py-2.5 hover:bg-terracotta/90 transition-colors disabled:opacity-60"
          >
            <Plus size={15} /> {saving ? "Adding…" : "Add image"}
          </button>
          {error && <p className="sm:col-span-4 text-sm text-terracotta">{error}</p>}
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {gallery?.map((img, i) => (
            <div key={i} className="relative group rounded-xl overflow-hidden aspect-square">
              <Image src={img.image} alt={img.caption} fill sizes="200px" className="object-cover" />
              <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/50 transition-colors" />
              <button
                onClick={() => removeImage(i)}
                disabled={deleting === i}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-ink/60 text-paper grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-40"
                aria-label="Delete image"
              >
                <Trash2 size={13} />
              </button>
              <span className="absolute bottom-2 left-2 right-2 text-paper text-xs opacity-0 group-hover:opacity-100 transition-opacity truncate">
                {img.caption}
              </span>
            </div>
          ))}
        </div>
        {gallery?.length === 0 && <p className="text-muted text-center py-10">No images yet for this destination.</p>}
      </AdminShell>
    </AdminGuard>
  );
}
