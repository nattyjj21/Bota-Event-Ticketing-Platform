"use client";
import Link from "next/link";
import { useState } from "react";

export default function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <div className="mx-auto max-w-[640px] px-4 py-10 sm:px-6">
      <Link href="/" className="text-xs text-bota-muted hover:text-white">← Home</Link>
      <h1 className="mt-4 font-display text-2xl tracking-wide text-white">CONTACT</h1>
      <p className="mt-1 text-sm text-bota-muted">Questions, partnerships, or support. We usually reply within 24 hours.</p>

      {sent ? (
        <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
          <div className="text-2xl">✓</div>
          <p className="mt-2 font-bold text-white">Message sent!</p>
          <p className="mt-1 text-xs text-bota-muted">We&apos;ll get back to you shortly.</p>
        </div>
      ) : (
        <form
          onSubmit={(e) => { e.preventDefault(); setSent(true); }}
          className="mt-6 space-y-3 rounded-2xl border border-white/[0.06] bg-bota-surface p-6"
        >
          <input required placeholder="Your name" className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-bota-muted outline-none" />
          <input required type="email" placeholder="Email" className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-bota-muted outline-none" />
          <textarea required rows={5} placeholder="Message" className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-bota-muted outline-none" />
          <button type="submit" className="btn-coral w-full rounded-xl bg-bota-coral py-3 text-sm font-bold text-[#0A0908]">Send message</button>
          <p className="text-center text-[11px] text-bota-muted">Or email us directly: hello@bota.et</p>
        </form>
      )}
    </div>
  );
}
