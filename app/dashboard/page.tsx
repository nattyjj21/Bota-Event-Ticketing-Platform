"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiSend } from "@/lib/api-client";
import { useStore } from "@/lib/store";
import type { OrderDTO } from "@/lib/data";

type OrgEvent = { id: string; slug: string; title: string; date: string; venue: string; published: boolean };
type Stats = { revenue: number; ticketsSold: number; pending: number; commission: number };

const EMPTY_STATS: Stats = { revenue: 0, ticketsSold: 0, pending: 0, commission: 0 };

export default function Dashboard() {
  const { user } = useStore();
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "awaiting_review" | "paid" | "rejected">("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await apiGet<{ orders: OrderDTO[]; events: OrgEvent[]; stats: Stats }>("/api/organizer/orders");
      setOrders(data.orders);
      setEvents(data.events);
      setStats(data.stats);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load your dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const decide = async (id: string, action: "approve" | "reject") => {
    setBusyId(id);
    try {
      const { order } = await apiSend<{ order: OrderDTO }>(`/api/organizer/orders/${id}`, "PATCH", { action });
      setOrders((prev) => prev.map((o) => (o.id === id ? order : o)));
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed.");
    } finally {
      setBusyId(null);
    }
  };

  const list = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const isAdmin = user?.role === "admin";

  return (
    <div className="mx-auto max-w-[1220px] px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="font-display text-xl tracking-wide text-white">{isAdmin ? "PLATFORM DASHBOARD" : "ORGANIZER DASHBOARD"}</h1>
          <p className="mt-1 text-xs text-bota-muted">
            {isAdmin ? "Every order across all organizers." : `Orders for ${user?.organizer?.businessName ?? "your events"} only.`}
          </p>
        </div>
        <Link href="/scan" className="rounded-lg bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/15">Open Scanner →</Link>
      </div>

      {error && <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-200">{error}</p>}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/[0.06] bg-bota-surface p-4">
          <div className="text-[11px] tracking-widest text-bota-muted">REVENUE</div>
          <div className="mt-1 font-display text-xl tracking-wide text-bota-gold">{stats.revenue.toLocaleString()} ETB</div>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-bota-surface p-4">
          <div className="text-[11px] tracking-widest text-bota-muted">TICKETS SOLD</div>
          <div className="mt-1 font-display text-xl tracking-wide text-white">{stats.ticketsSold}</div>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-bota-surface p-4">
          <div className="text-[11px] tracking-widest text-bota-muted">PENDING</div>
          <div className="mt-1 font-display text-xl tracking-wide text-bota-gold">{stats.pending}</div>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-bota-surface p-4">
          <div className="text-[11px] tracking-widest text-bota-muted">COMMISSION OWED (2%)</div>
          <div className="mt-1 font-display text-xl tracking-wide text-bota-coral">{stats.commission.toLocaleString()} ETB</div>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        {(["all", "awaiting_review", "paid", "rejected"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold ${filter === f ? "border-bota-coral bg-bota-coral text-[#0A0908]" : "border-white/10 bg-white/[0.03] text-bota-muted hover:border-white/20"}`}>
            {f === "all" ? "All" : f === "awaiting_review" ? "Pending" : f === "paid" ? "Approved" : "Rejected"}
          </button>
        ))}
        {isAdmin && (
          <Link href="/admin" className="ml-auto rounded-full border border-white/10 px-3.5 py-1.5 text-xs font-semibold text-bota-muted hover:text-white">Admin view →</Link>
        )}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/[0.06] bg-bota-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/[0.06] text-[11px] tracking-widest text-bota-muted">
              <tr><th className="px-4 py-3">BUYER</th><th className="px-4 py-3">EVENT</th><th className="px-4 py-3">TIER × QTY</th><th className="px-4 py-3">TOTAL</th><th className="px-4 py-3">REFERENCE</th><th className="px-4 py-3">STATUS</th><th className="px-4 py-3">ACTION</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-bota-muted">Loading…</td></tr>
              ) : list.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-bota-muted">No orders yet. Share your event and orders will appear here.</td></tr>
              ) : list.map((o) => (
                <tr key={o.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3"><div className="font-semibold text-white">{o.buyerName}</div><div className="text-bota-muted">{o.buyerEmail} · {o.buyerPhone}</div></td>
                  <td className="px-4 py-3 text-bota-text">{o.eventTitle.slice(0, 28)}</td>
                  <td className="px-4 py-3 text-bota-text">{o.tierName} × {o.qty}</td>
                  <td className="px-4 py-3 font-bold text-bota-gold">{o.total === 0 ? "FREE" : `${o.total} ETB`}</td>
                  <td className="px-4 py-3 font-mono text-bota-muted">{o.reference ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${o.status === "paid" ? "bg-emerald-500/15 text-emerald-300" : o.status === "rejected" ? "bg-red-500/15 text-red-300" : "bg-amber-500/15 text-amber-200"}`}>{o.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {o.status === "awaiting_review" ? (
                      <div className="flex gap-1.5">
                        <button disabled={busyId === o.id} onClick={() => decide(o.id, "approve")} className="rounded-lg bg-emerald-500 px-3 py-1.5 text-[11px] font-bold text-black hover:bg-emerald-400 disabled:opacity-50">Approve</button>
                        <button disabled={busyId === o.id} onClick={() => decide(o.id, "reject")} className="rounded-lg border border-white/15 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-white/10 disabled:opacity-50">Reject</button>
                      </div>
                    ) : (
                      <span className="text-bota-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* per-event backup list */}
      <div className="mt-6">
        <h2 className="text-xs font-bold tracking-widest text-white">BACKUP LISTS</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {events.length === 0 && <p className="text-xs text-bota-muted">No events yet.</p>}
          {events.slice(0, 6).map((ev) => {
            const evPaid = orders.filter((o) => o.eventId === ev.id && o.status === "paid");
            return (
              <div key={ev.id} className="rounded-xl border border-white/[0.06] bg-bota-surface p-4">
                <div className="text-xs font-bold text-white">{ev.title}</div>
                <div className="text-xs text-bota-muted">{evPaid.length} orders · {evPaid.reduce((a, o) => a + o.qty, 0)} tickets</div>
                <button
                  onClick={() => {
                    const rows = evPaid.map((o, i) => `${i + 1}. ${o.buyerName} — ${o.buyerEmail} — ${o.tierName} ×${o.qty} — ${new Date(o.createdAt).toLocaleString()} — ${o.code ?? o.id}  [ ]`).join("\n");
                    const content = `BOTA — Backup Attendee List\n${ev.title}\n${ev.date} · ${ev.venue}\nPrinted: ${new Date().toLocaleString()}\n\n${rows || "(no approved tickets yet)"}\n`;
                    const blob = new Blob([content], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a"); a.href = url; a.download = `${ev.slug}-backup.txt`; a.click(); URL.revokeObjectURL(url);
                  }}
                  className="mt-3 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-white hover:bg-white/5"
                >
                  Download Backup List (.txt)
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
