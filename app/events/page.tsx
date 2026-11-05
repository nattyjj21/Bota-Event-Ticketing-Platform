"use client";
import { useMemo } from "react";
import { categories } from "@/lib/data";
import EventCard from "@/components/EventCard";
import { useStore } from "@/lib/store";
import { useEvents } from "@/lib/hooks";
import Link from "next/link";

export default function EventsPage() {
  const { search, setSearch, category, setCategory } = useStore();
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
          e.organizer.name.toLowerCase().includes(q)
      );
    }
    return list;
  }, [events, search, category]);

  return (
    <div className="mx-auto max-w-[1220px] px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-2xl tracking-wide text-white">ALL EVENTS</h1>
        <Link href="/" className="text-xs font-bold text-bota-coral hover:underline">← Home</Link>
      </div>
      <div className="mt-4 flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/[0.06] bg-black/30 px-3 py-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events, venues, organizers..." className="w-full bg-transparent text-sm text-white placeholder:text-bota-muted outline-none" />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {categories.map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={`pill rounded-full px-3.5 py-1.5 text-xs font-semibold ${category === c ? "pill-active" : "pill-inactive"}`}>{c}</button>
        ))}
      </div>

      {loading ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[268px] animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.02]" />
          ))}
        </div>
      ) : error ? (
        <p className="mt-8 rounded-xl border border-red-500/20 bg-red-500/5 px-6 py-10 text-center text-sm text-red-200">{error}</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}
      {!loading && !error && filtered.length === 0 && <p className="mt-8 text-center text-sm text-bota-muted">No events found.</p>}
    </div>
  );
}
