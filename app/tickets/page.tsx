"use client";
import Link from "next/link";
import { useMyOrders } from "@/lib/hooks";

export default function MyTicketsPage() {
  const { orders, loading, error } = useMyOrders();

  return (
    <div className="mx-auto max-w-[1220px] px-4 py-8 sm:px-6">
      <div className="flex items-baseline justify-between">
        <h1 className="font-display text-2xl tracking-wide text-white">MY TICKETS</h1>
        <Link href="/events" className="text-xs font-bold text-bota-coral hover:underline">Browse events →</Link>
      </div>
      <p className="mt-1 text-xs text-bota-muted">Every ticket you&apos;ve claimed. Paid orders show a QR once the organizer approves them.</p>

      {loading ? (
        <div className="mt-6 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[92px] animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.02]" />
          ))}
        </div>
      ) : error ? (
        <p className="mt-8 rounded-xl border border-red-500/20 bg-red-500/5 px-6 py-10 text-center text-sm text-red-200">{error}</p>
      ) : orders.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-white/[0.06] bg-bota-surface px-6 py-14 text-center">
          <h2 className="font-display text-lg tracking-wide text-white">NO TICKETS YET</h2>
          <p className="mt-2 text-sm text-bota-muted">When you claim a spot, your ticket appears here.</p>
          <Link href="/events" className="btn-coral mt-6 inline-block rounded-xl bg-bota-coral px-6 py-3 text-xs font-bold text-[#0A0908]">Find an event</Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-bota-surface p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${o.status === "paid" ? "bg-emerald-500/15 text-emerald-300" : o.status === "rejected" ? "bg-red-500/15 text-red-300" : "bg-amber-500/15 text-amber-200"}`}>
                    {o.status === "paid" ? "APPROVED" : o.status === "rejected" ? "REJECTED" : "AWAITING REVIEW"}
                  </span>
                  <span className="text-[11px] text-bota-muted">{new Date(o.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="mt-1.5 truncate text-sm font-bold text-white">{o.eventTitle}</div>
                <div className="text-xs text-bota-muted">{o.eventVenue} · {o.eventDate}</div>
                <div className="mt-1 text-xs text-bota-text">{o.tierName} × {o.qty} · <span className="font-bold text-bota-gold">{o.total === 0 ? "FREE" : `${o.total} ETB`}</span></div>
              </div>
              {o.status === "paid" && o.code ? (
                <Link href={`/ticket/${o.code}`} className="shrink-0 rounded-xl bg-bota-coral px-4 py-2.5 text-center text-xs font-bold text-[#0A0908]">View QR ticket</Link>
              ) : o.status === "rejected" ? (
                <span className="shrink-0 text-xs text-red-300/80">Order rejected by organizer</span>
              ) : (
                <span className="shrink-0 text-xs text-bota-muted">Waiting for the organizer to confirm your payment.</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
