"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/client/AuthProvider";

export default function SettingsPage() {
  const { user, loading, refresh } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError(null);
    setProfileMessage(null);
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    const data = await res.json();
    setProfileSaving(false);
    if (!res.ok) {
      setProfileError(data.error ?? "Couldn't save changes");
      return;
    }
    setProfileMessage("Profile updated.");
    refresh();
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordError(null);
    setPasswordMessage(null);
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setPasswordSaving(false);
    if (!res.ok) {
      setPasswordError(data.error ?? "Couldn't change password");
      return;
    }
    setPasswordMessage("Password changed.");
    setCurrentPassword("");
    setNewPassword("");
  }

  if (loading) return <div className="pt-32 text-center text-muted">Loading…</div>;

  if (!user) {
    return (
      <div className="pt-32 pb-24 text-center px-6">
        <h1 className="font-display text-3xl mb-3">Sign in to manage your settings</h1>
        <Link
          href="/login"
          className="inline-block mt-4 rounded-full bg-terracotta text-paper text-sm font-medium px-6 py-3 hover:bg-terracotta/90 transition-colors"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 px-6">
      <div className="max-w-lg mx-auto">
        <p className="text-xs tracking-wide text-terracotta mb-3">SETTINGS</p>
        <h1 className="font-display text-3xl md:text-4xl mb-12">Account settings</h1>

        <form onSubmit={saveProfile} className="rounded-3xl bg-white border border-ink/8 p-7 mb-8 space-y-4">
          <h2 className="font-display text-xl mb-2">Profile</h2>
          <div>
            <label className="block text-sm text-muted mb-1.5">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-ink/15 rounded-xl px-4 py-3 text-sm bg-paper"
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-ink/15 rounded-xl px-4 py-3 text-sm bg-paper"
            />
          </div>
          {profileError && <p className="text-sm text-terracotta">{profileError}</p>}
          {profileMessage && <p className="text-sm text-olive">{profileMessage}</p>}
          <button
            type="submit"
            disabled={profileSaving}
            className="rounded-full bg-ink text-paper text-sm font-medium px-6 py-3 hover:bg-ink/90 transition-colors disabled:opacity-60"
          >
            {profileSaving ? "Saving…" : "Save profile"}
          </button>
        </form>

        <form onSubmit={savePassword} className="rounded-3xl bg-white border border-ink/8 p-7 space-y-4">
          <h2 className="font-display text-xl mb-2">Change password</h2>
          <div>
            <label className="block text-sm text-muted mb-1.5">Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-ink/15 rounded-xl px-4 py-3 text-sm bg-paper"
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1.5">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              className="w-full border border-ink/15 rounded-xl px-4 py-3 text-sm bg-paper"
            />
          </div>
          {passwordError && <p className="text-sm text-terracotta">{passwordError}</p>}
          {passwordMessage && <p className="text-sm text-olive">{passwordMessage}</p>}
          <button
            type="submit"
            disabled={passwordSaving || !currentPassword || !newPassword}
            className="rounded-full bg-terracotta text-paper text-sm font-medium px-6 py-3 hover:bg-terracotta/90 transition-colors disabled:opacity-60"
          >
            {passwordSaving ? "Saving…" : "Change password"}
          </button>
        </form>
      </div>
    </div>
  );
}
