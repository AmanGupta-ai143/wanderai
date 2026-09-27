"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/client/AuthProvider";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { login, register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result =
      mode === "login" ? await login(email, password) : await register(name, email, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "Something went wrong");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="max-w-sm mx-auto">
      <p className="text-xs tracking-wide text-terracotta mb-3 text-center">
        {mode === "login" ? "WELCOME BACK" : "JOIN WANDERAI"}
      </p>
      <h1 className="font-display text-3xl md:text-4xl text-center mb-8">
        {mode === "login" ? "Sign in" : "Create your account"}
      </h1>

      <form onSubmit={onSubmit} className="space-y-4">
        {mode === "register" && (
          <div>
            <label className="block text-sm text-muted mb-1.5">Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-ink/15 rounded-xl px-4 py-3 text-sm bg-paper"
              placeholder="Your name"
            />
          </div>
        )}
        <div>
          <label className="block text-sm text-muted mb-1.5">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-ink/15 rounded-xl px-4 py-3 text-sm bg-paper"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1.5">Password</label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-ink/15 rounded-xl px-4 py-3 text-sm bg-paper"
            placeholder="••••••••"
            minLength={6}
          />
        </div>

        {error && <p className="text-sm text-terracotta">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-terracotta text-paper text-sm font-medium py-3.5 hover:bg-terracotta/90 transition-colors disabled:opacity-60"
        >
          {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>

      {mode === "login" ? (
        <>
          <p className="text-center text-sm text-muted mt-6">
            New here?{" "}
            <Link href="/register" className="text-terracotta font-medium">
              Create an account
            </Link>
          </p>
          <div className="mt-8 rounded-xl bg-sand/60 px-4 py-3 text-xs text-muted">
            Demo accounts — admin@wanderai.app / admin123 · demo@wanderai.app / traveler123
          </div>
        </>
      ) : (
        <p className="text-center text-sm text-muted mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-terracotta font-medium">
            Sign in
          </Link>
        </p>
      )}
    </div>
  );
}
