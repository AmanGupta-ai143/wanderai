"use client";

import { useEffect, useState } from "react";
import { Trash2, ShieldCheck, ShieldOff } from "lucide-react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import { useAuth } from "@/lib/client/AuthProvider";

type AdminUser = { id: string; name: string; email: string; role: "USER" | "ADMIN"; createdAt: string };

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users));
  }

  useEffect(load, []);

  async function toggleRole(u: AdminUser) {
    setBusy(u.id);
    setError(null);
    const newRole = u.role === "ADMIN" ? "USER" : "ADMIN";
    const res = await fetch(`/api/admin/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    const data = await res.json();
    setBusy(null);
    if (!res.ok) {
      setError(data.error ?? "Couldn't update role");
      return;
    }
    load();
  }

  async function remove(u: AdminUser) {
    if (!confirm(`Delete ${u.name}? This can't be undone.`)) return;
    setBusy(u.id);
    setError(null);
    const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) {
      setError(data.error ?? "Couldn't delete user");
      return;
    }
    load();
  }

  return (
    <AdminGuard>
      <AdminShell>
        <p className="text-xs tracking-wide text-terracotta mb-2">PEOPLE</p>
        <h1 className="font-display text-3xl mb-8">Users</h1>

        {error && <p className="text-sm text-terracotta mb-4">{error}</p>}

        <div className="rounded-2xl bg-white border border-ink/8 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sand/60 text-left text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((u) => (
                <tr key={u.id} className="border-t border-ink/8">
                  <td className="px-5 py-3.5 font-medium">
                    {u.name}
                    {u.id === me?.id && <span className="text-xs text-muted"> (you)</span>}
                  </td>
                  <td className="px-5 py-3.5 text-muted">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full ${
                        u.role === "ADMIN" ? "bg-terracotta/15 text-terracotta" : "bg-sand text-ink/70"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => toggleRole(u)}
                        disabled={busy === u.id || (u.id === me?.id && u.role === "ADMIN")}
                        className="text-ink/60 hover:text-terracotta disabled:opacity-30"
                        aria-label={u.role === "ADMIN" ? "Remove admin" : "Make admin"}
                        title={u.role === "ADMIN" ? "Remove admin access" : "Grant admin access"}
                      >
                        {u.role === "ADMIN" ? <ShieldOff size={15} /> : <ShieldCheck size={15} />}
                      </button>
                      <button
                        onClick={() => remove(u)}
                        disabled={busy === u.id || u.id === me?.id}
                        className="text-ink/60 hover:text-terracotta disabled:opacity-30"
                        aria-label="Delete user"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users?.length === 0 && <p className="text-center text-muted py-10">No users yet.</p>}
        </div>
      </AdminShell>
    </AdminGuard>
  );
}
