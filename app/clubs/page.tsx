"use client";
import { useEvents } from "@/lib/hooks";
import { CheckCircle2, Users, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ClubsPage() {
  const { events, loading } = useEvents();

  // Extract unique organizers from the live catalogue.
  const organizers = Array.from(
    new Map(events.map((e) => [e.organizer.id, e.organizer])).values()
  );

  return (
    <div className="mx-auto max-w-[1220px] px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1 className="font-display text-[32px] tracking-wide text-white sm:text-[48px]">VENUES & CLUBS</h1>
        <p className="mt-2 text-sm text-bota-muted">Discover the top organizers and event spaces in Ethiopia.</p>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[240px] animate-pulse rounded-[32px] border border-white/[0.06] bg-white/[0.02]" />
          ))}
        </div>
      ) : organizers.length === 0 ? (
        <p className="rounded-2xl border border-white/[0.06] bg-bota-surface px-6 py-12 text-center text-sm text-bota-muted">
          No organizers are live yet. Check back soon.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {organizers.map((org) => {
            const orgEvents = events.filter((e) => e.organizer.id === org.id);
            return (
              <div key={org.id} className="group relative overflow-hidden rounded-[32px] border border-white/[0.06] bg-bota-surface p-6 transition-all hover:border-bota-gold/30">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-bota-gold">
                    <Users size={32} />
                  </div>
                  {org.verified && (
                    <div className="flex items-center gap-1 rounded-full bg-bota-gold/10 px-3 py-1 text-[10px] font-bold text-bota-gold">
                      <CheckCircle2 size={12} /> VERIFIED
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-bota-gold transition-colors">{org.name}</h3>
                <div className="mt-2 flex items-center gap-2 text-xs text-bota-muted">
                  <MapPin size={14} />
                  <span>Ethiopia</span>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-6">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-bota-muted">Active Events</div>
                    <div className="text-sm font-bold text-white">{orgEvents.length}</div>
                  </div>
                  <Link href="/#events" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white transition-all group-hover:bg-bota-gold group-hover:text-bota-surface">
                    <ArrowRight size={20} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-20 rounded-[40px] border border-white/[0.06] bg-gradient-to-br from-bota-gold/5 via-transparent to-bota-coral/5 p-8 text-center sm:p-16">
        <h2 className="font-display text-[32px] tracking-wide text-white sm:text-[48px]">WANT TO HOST EVENTS?</h2>
        <p className="mx-auto mt-4 max-w-[500px] text-sm text-bota-muted">
          Join Ethiopia&apos;s fastest growing event network. Get verified, reach thousands of fans, and manage your tickets with zero stress.
        </p>
        <Link href="/become-organizer" className="btn-coral mt-10 inline-flex rounded-2xl bg-bota-coral px-10 py-4 text-sm font-bold text-[#0A0908]">
          Start Hosting Now
        </Link>
      </div>
    </div>
  );
}
