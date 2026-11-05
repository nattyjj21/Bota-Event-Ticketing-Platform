"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiSend } from "@/lib/api-client";
import { useStore, type SessionUser } from "@/lib/store";

export default function AuthCard({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const sp = useSearchParams();
  const { refresh } = useStore();
  const next = sp.get("next");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isSignup = mode === "signup";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { user } = await apiSend<{ user: SessionUser }>(
        isSignup ? "/api/auth/signup" : "/api/auth/login",
        "POST",
        isSignup ? { name, email, password, phone } : { email, password }
      );
      await refresh();
      const fallback = user.role === "admin" ? "/admin" : user.role === "organizer" ? "/dashboard" : "/";
      router.push(next || fallback);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-[440px] flex-col justify-center px-4 py-12">
      <div className="rounded-3xl border border-white/[0.06] bg-bota-surface p-7 sm:p-8">
        <Link href="/" className="font-display text-[26px] tracking-[0.08em] text-bota-coral">BOTA</Link>
        <h1 className="mt-4 font-display text-2xl tracking-wide text-white">
          {isSignup ? "CREATE YOUR ACCOUNT" : "WELCOME BACK"}
        </h1>
        <p className="mt-1.5 text-xs leading-relaxed text-bota-muted">
          {isSignup
            ? "Sign up to buy tickets. You can apply to become an organizer any time after."
            : "Sign in to buy tickets, manage your events and scan at the gate."}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          {isSignup && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              autoComplete="name"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-3 text-sm text-white placeholder:text-bota-muted outline-none focus:border-bota-coral/50"
            />
          )}
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            autoComplete="email"
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-3 text-sm text-white placeholder:text-bota-muted outline-none focus:border-bota-coral/50"
          />
          {isSignup && (
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone (e.g. 0912345678) — optional"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-3 text-sm text-white placeholder:text-bota-muted outline-none focus:border-bota-coral/50"
            />
          )}
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-3 text-sm text-white placeholder:text-bota-muted outline-none focus:border-bota-coral/50"
          />

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="btn-coral w-full rounded-xl bg-bota-coral py-3.5 text-sm font-bold text-[#0A0908] disabled:opacity-50"
          >
            {busy ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-bota-muted">
          {isSignup ? "Already have an account? " : "New to Bota? "}
          <Link
            href={`${isSignup ? "/login" : "/signup"}${next ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="font-bold text-bota-coral hover:underline"
          >
            {isSignup ? "Sign in" : "Create one"}
          </Link>
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
        <div className="text-[10px] font-bold uppercase tracking-widest text-bota-muted">Demo accounts</div>
        <ul className="mt-2 space-y-1 text-[11px] text-bota-muted">
          <li>Admin — <span className="text-bota-text">admin@bota.et</span> / admin123</li>
          <li>Organizer — <span className="text-bota-text">hawassa@bota.et</span> / organizer123</li>
          <li>Buyer — <span className="text-bota-text">buyer@bota.et</span> / buyer123</li>
        </ul>
      </div>
    </div>
  );
}
