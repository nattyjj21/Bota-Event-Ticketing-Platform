"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { apiSend } from "@/lib/api-client";
import Link from "next/link";

export default function BecomeOrganizer() {
  const { user, loading, refresh } = useStore();
  const [businessName, setBusinessName] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [payoutMethod, setPayoutMethod] = useState("");
  const [payoutAccount, setPayoutAccount] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await apiSend("/api/organizer/apply", "POST", {
        businessName,
        instagram,
        tiktok,
        phone,
        payoutMethod,
        payoutAccount,
        commissionAgreed: agreed,
      });
      await refresh();
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your application.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-10 sm:px-6">
        <div className="h-[320px] animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.02]" />
      </div>
    );
  }

  // Not signed in — the account comes first.
  if (!user) {
    return (
      <div className="mx-auto max-w-[640px] px-4 py-14 text-center sm:px-6">
        <div className="rounded-2xl border border-white/[0.06] bg-bota-surface p-8">
          <h1 className="font-display text-xl tracking-wide text-white">CREATE AN ACCOUNT FIRST</h1>
          <p className="mx-auto mt-2 max-w-[460px] text-sm leading-relaxed text-bota-muted">
            Organizer accounts start as a normal Bota account. Sign up or sign in, then apply to sell tickets.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/signup?next=/become-organizer" className="rounded-lg bg-bota-coral px-5 py-2.5 text-xs font-bold text-[#0A0908]">Sign up</Link>
            <Link href="/login?next=/become-organizer" className="rounded-lg bg-white/10 px-5 py-2.5 text-xs font-bold text-white">Sign in</Link>
          </div>
        </div>
      </div>
    );
  }

  const org = user.organizer;

  if (done || (org && org.status === "pending")) {
    return (
      <div className="mx-auto max-w-[640px] px-4 py-14 text-center sm:px-6">
        <div className="rounded-2xl border border-white/[0.06] bg-bota-surface p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15 text-xl">⏳</div>
          <h1 className="mt-4 font-display text-xl tracking-wide text-white">SUBMITTED — PENDING REVIEW</h1>
          <p className="mx-auto mt-2 max-w-[480px] text-sm leading-relaxed text-bota-muted">
            We&apos;ll review your business details and social accounts shortly. Once approved, your account gains organizer access and your own dashboard and scanner.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/" className="rounded-lg bg-bota-coral px-5 py-2.5 text-xs font-bold text-[#0A0908]">Browse events</Link>
            <Link href="/tickets" className="rounded-lg bg-white/10 px-5 py-2.5 text-xs font-bold text-white">My tickets</Link>
          </div>
        </div>
      </div>
    );
  }

  if (org && org.status === "approved") {
    return (
      <div className="mx-auto max-w-[640px] px-4 py-14 text-center sm:px-6">
        <div className="rounded-2xl border border-white/[0.06] bg-bota-surface p-8">
          <h1 className="font-display text-xl tracking-wide text-white">YOU&apos;RE A VERIFIED ORGANIZER</h1>
          <p className="mt-2 text-sm text-bota-muted">{org.businessName} is approved and live on Bota.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/dashboard" className="rounded-lg bg-bota-coral px-5 py-2.5 text-xs font-bold text-[#0A0908]">Go to dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[720px] px-4 py-8 sm:px-6">
      <Link href="/" className="text-xs text-bota-muted hover:text-white">← Home</Link>
      <h1 className="mt-4 font-display text-2xl tracking-wide text-white">BECOME AN ORGANIZER</h1>
      <p className="mt-1 text-sm text-bota-muted">Sell tickets on Bota. Get verified, add your payout account, and start selling. 2% commission — no hidden fees.</p>

      {org && org.status === "rejected" && (
        <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-200">
          Your previous application was not approved. You can update your details and re-submit below.
        </p>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div className="rounded-2xl border border-white/[0.06] bg-bota-surface p-6">
          <h2 className="text-xs font-bold tracking-widest text-white">BUSINESS DETAILS</h2>
          <div className="mt-4 grid gap-3">
            <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Business / organizer name (required)" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-bota-muted outline-none focus:border-bota-coral/50" />
            <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="Instagram business link (https://instagram.com/...)" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-bota-muted outline-none focus:border-bota-coral/50" />
            <input value={tiktok} onChange={(e) => setTiktok(e.target.value)} placeholder="TikTok business link (https://tiktok.com/...)" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-bota-muted outline-none focus:border-bota-coral/50" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Contact phone (e.g. 0912345678)" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-bota-muted outline-none focus:border-bota-coral/50" />
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-bota-surface p-6">
          <h2 className="text-xs font-bold tracking-widest text-white">PAYOUT ACCOUNT (SET AFTER APPROVAL)</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <select value={payoutMethod} onChange={(e) => setPayoutMethod(e.target.value)} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-bota-coral/50">
              <option value="">Payout method…</option>
              <option value="telebirr">TeleBirr</option>
              <option value="cbe">CBE</option>
              <option value="boa">Bank of Abyssinia</option>
            </select>
            <input value={payoutAccount} onChange={(e) => setPayoutAccount(e.target.value)} placeholder="Account / phone number" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-bota-muted outline-none focus:border-bota-coral/50" />
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
          <h3 className="text-xs font-bold tracking-widest text-amber-200">2% COMMISSION — PLEASE READ</h3>
          <p className="mt-2 text-xs leading-relaxed text-amber-100/80">Bota takes a 2% commission on every ticket you sell. It is tracked automatically from issued QR codes (1 QR = 1 paid ticket). You settle with Bota separately — nothing is auto-deducted at checkout.</p>
          <p className="mt-2 text-xs leading-relaxed text-amber-100/80">Example: 100 tickets at 150 ETB → revenue 15,000 ETB → commission owed 300 ETB.</p>
          <label className="mt-4 flex items-start gap-2">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5" />
            <span className="text-xs font-semibold text-amber-100">I understand and agree to the 2% commission.</span>
          </label>
        </div>

        {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-200">{error}</div>}

        <button type="submit" disabled={!agreed || !businessName.trim() || busy} className="btn-coral w-full rounded-xl bg-bota-coral py-3 text-sm font-bold text-[#0A0908] disabled:opacity-40">
          {busy ? "Submitting…" : "Submit for verification"}
        </button>
      </form>
    </div>
  );
}
