"use client";
import Link from "next/link";
import { useMemo } from "react";
import { categories } from "@/lib/data";
import EventCard from "@/components/EventCard";
import { useStore } from "@/lib/store";
import { useEvents } from "@/lib/hooks";

export default function HomePage() {
  const { search, setSearch, category, setCategory, user } = useStore();
  const { events, loading, error } = useEvents();

  const filtered = useMemo(() => {
    let list = events;
    if (category !== "All") list = list.filter((e) => e.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.organizer.name.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [events, search, category]);

  return (
    <>
      {/* HERO */}
      <section className="hero-bg border-b border-white/[0.04]">
        <div className="relative mx-auto max-w-[1220px] px-4 pb-14 pt-14 text-center sm:px-6 sm:pt-16">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-bota-gold">Ethiopia&apos;s Event Marketplace</p>
          <h1 className="mx-auto mt-4 max-w-[520px] font-display text-[44px] leading-[0.95] tracking-[0.02em] text-white sm:text-[56px]">
            CLAIM YOUR SPOT.
          </h1>
          <p className="mx-auto mt-4 max-w-[560px] text-[13px] leading-relaxed text-bota-muted sm:text-[14px]">
            Discover nightlife, concerts, festivals and gatherings near you — buy your ticket, get your QR code, walk in.
          </p>

          {/* Search */}
          <div className="mx-auto mt-7 flex max-w-[520px] items-center gap-2 rounded-xl border border-white/[0.06] bg-black/30 p-1.5 backdrop-blur">
            <div className="flex flex-1 items-center gap-2 pl-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9B948A" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-3.5-3.5" /></svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events, venues, organizers..."
                className="w-full bg-transparent text-[13px] text-white placeholder:text-bota-muted/70 outline-none"
              />
              {search && (
                <button onClick={() => setSearch("")} className="pr-2 text-xs text-bota-muted hover:text-white">✕</button>
              )}
            </div>
            <button
              onClick={() => document.getElementById("events")?.scrollIntoView({ behavior: "smooth" })}
              className="btn-coral shrink-0 rounded-lg bg-bota-coral px-5 py-2 text-xs font-bold text-[#0A0908]"
            >
              Search
            </button>
          </div>

          {/* Pills */}
          <div className="mx-auto mt-4 flex max-w-[620px] flex-wrap items-center justify-center gap-1.5">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`pill rounded-full px-3.5 py-1.5 text-[11px] font-semibold ${category === c ? "pill-active" : "pill-inactive"}`}
              >
                {c}
              </button>
            ))}
          </div>

          {!user && (
            <p className="mx-auto mt-5 max-w-[520px] text-[11px] text-bota-muted">
              <Link href="/signup" className="font-bold text-bota-coral hover:underline">Create a free account</Link>{" "}
              to buy tickets — you can apply to become an organizer afterwards.
            </p>
          )}
        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <section id="events" className="mx-auto max-w-[1220px] px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-[22px] tracking-wide text-white sm:text-[26px]">UPCOMING EVENTS</h2>
          <Link href="/events" className="text-[11px] font-bold tracking-wide text-bota-coral hover:text-bota-coralHover">View all →</Link>
        </div>

        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[268px] animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.02]" />
            ))}
          </div>
        ) : error ? (
          <p className="mt-8 rounded-xl border border-red-500/20 bg-red-500/5 px-6 py-10 text-center text-sm text-red-200">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="mt-8 rounded-xl border border-white/10 bg-white/[0.02] px-6 py-10 text-center text-sm text-bota-muted">
            No events match your search. Try a different keyword or category.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        )}

        {/* CTA band */}
        <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/[0.06] bg-bota-surface px-6 py-6 sm:flex-row sm:items-center sm:px-8">
          <div>
            <h3 className="font-display text-[17px] tracking-wide text-white">HAVE AN EVENT? SELL TICKETS ON BOTA.</h3>
            <p className="mt-1.5 max-w-[720px] text-xs leading-relaxed text-bota-muted">
              Get verified, set up your own payment account, and start selling in minutes. Bota takes a simple 2% commission — no hidden fees.
            </p>
          </div>
          <Link href="/become-organizer" className="btn-coral shrink-0 rounded-lg bg-bota-coral px-5 py-2.5 text-xs font-bold text-[#0A0908]">
            Become an Organizer
          </Link>
        </div>
      </section>
    </>
  );
}
