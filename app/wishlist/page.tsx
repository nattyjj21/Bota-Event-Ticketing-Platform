"use client";
import { useStore } from "@/lib/store";
import { useEvents } from "@/lib/hooks";
import EventCard from "@/components/EventCard";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function WishlistPage() {
  const { wishlist } = useStore();
  const { events, loading } = useEvents();
  const wishlistedEvents = events.filter((e) => wishlist.includes(e.id));

  return (
    <div className="mx-auto max-w-[1220px] px-4 py-12 sm:px-6">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="font-display text-[32px] tracking-wide text-white sm:text-[48px]">YOUR WISHLIST</h1>
          <p className="mt-2 text-sm text-bota-muted">Events you&apos;ve saved for later. Don&apos;t miss out!</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-bota-coral/10 text-bota-coral">
          <Heart size={24} fill="currentColor" />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[268px] animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.02]" />
          ))}
        </div>
      ) : wishlistedEvents.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {wishlistedEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/5 text-bota-muted">
            <Heart size={40} />
          </div>
          <h2 className="text-lg font-bold text-white">Your wishlist is empty</h2>
          <p className="mt-2 text-sm text-bota-muted">Start exploring events and save your favorites here.</p>
          <Link href="/#events" className="btn-coral mt-8 rounded-xl bg-bota-coral px-8 py-3 text-sm font-bold text-[#0A0908]">
            Browse Events
          </Link>
        </div>
      )}
    </div>
  );
}
