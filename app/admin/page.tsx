"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiSend } from "@/lib/api-client";
import type { OrderDTO } from "@/lib/data";

type OrgRow = {
  id: string;
  businessName: string;
  email: string;
  status: string;
  instagram: string | null;
  tiktok: string | null;
  createdAt: string;
  events: number;
  tickets: number;
  gmv: number;
  commission: number;
};

type Overview = {
  orders: OrderDTO[];
  organizers: OrgRow[];
  users: { id: string; name: string; email: string; role: string; createdAt: string }[];
  stats: {
    gmv: number;
    commission: number;
    ticketsIssued: number;
    pendingOrgs: number;
    organizerCount: number;
    userCount: number;
    eventCount: number;
    orderCount: number;
  };
};

const statusStyle = (s: string) =>
  s === "paid" || s === "approved" ? "bg-emerald-500/15 text-emerald-300" : s === "rejected" ? "bg-red-500/15 text-red-300" : "bg-amber-500/15 text-amber-200";

export default function AdminPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const d = await apiGet<Overview>("/api/admin/overview");
      setData(d);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load admin data.");
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
      await apiSend(`/api/admin/organizers/${id}`, "PATCH", { action });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed.");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[1220px] px-4 py-6 sm:px-6">
        <div className="h-8 w-64 animate-pulse rounded bg-white/[0.04]" />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-[86px] animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.02]" />)}
        </div>
      </div>
    );
  }

  if (error && !data) {
    return <p className="mx-auto mt-10 max-w-[1220px] px-4 text-sm text-red-200 sm:px-6">{error}</p>;
  }

  const stats = data!.stats;
  const orders = data!.orders;
  const organizers = data!.organizers;

  return (
    <div className="mx-auto max-w-[1220px] px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-xl tracking-wide text-white">PLATFORM ADMIN</h1>
        <Link href="/admin/organizers" className="rounded-lg bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/15">Organizers & Commission →</Link>
      </div>

      {error && <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-200">{error}</p>}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "TOTAL GMV", value: `${stats.gmv.toLocaleString()} ETB`, color: "text-bota-gold" },
          { label: "TICKETS ISSUED", value: String(stats.ticketsIssued), color: "text-white" },
          { label: "COMMISSION (2%)", value: `${stats.commission.toLocaleString()} ETB`, color: "text-bota-coral" },
          { label: "PENDING ORGS", value: String(stats.pendingOrgs), color: "text-amber-300" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/[0.06] bg-bota-surface p-4">
            <div className="text-[11px] tracking-widest text-bota-muted">{s.label}</div>
            <div className={`mt-1 font-display text-xl tracking-wide ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        {[
          { label: "USERS", value: stats.userCount },
          { label: "ORGANIZERS", value: stats.organizerCount },
          { label: "EVENTS", value: stats.eventCount },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="text-[11px] tracking-widest text-bota-muted">{s.label}</div>
            <div className="mt-1 font-display text-lg tracking-wide text-white">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Organizer verification queue */}
      <div className="mt-6 rounded-2xl border border-white/[0.06] bg-bota-surface p-5">
        <h2 className="text-xs font-bold tracking-widest text-white">ORGANIZER VERIFICATION QUEUE</h2>
        <p className="mt-1 text-xs text-bota-muted">Approving grants that user organizer access and their own dashboard.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/[0.06] text-[11px] tracking-widest text-bota-muted">
              <tr><th className="px-3 py-3">ORGANIZER</th><th className="px-3 py-3">SOCIALS</th><th className="px-3 py-3">SUBMITTED</th><th className="px-3 py-3">STATUS</th><th className="px-3 py-3">ACTION</th></tr>
            </thead>
            <tbody>
              {organizers.length === 0 ? (
                <tr><td colSpan={5} className="px-3 py-10 text-center text-bota-muted">No organizer applications yet.</td></tr>
              ) : organizers.map((o) => (
                <tr key={o.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-3 py-3"><div className="font-semibold text-white">{o.businessName}</div><div className="text-bota-muted">{o.email}</div></td>
                  <td className="px-3 py-3 text-bota-muted">{o.instagram || "—"} · {o.tiktok || "—"}</td>
                  <td className="px-3 py-3 text-bota-muted">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${statusStyle(o.status)}`}>{o.status}</span></td>
                  <td className="px-3 py-3">
                    {o.status === "pending" ? (
                      <div className="flex gap-1.5">
                        <button disabled={busyId === o.id} onClick={() => decide(o.id, "approve")} className="rounded-lg bg-emerald-500 px-3 py-1.5 text-[11px] font-bold text-black hover:bg-emerald-400 disabled:opacity-50">Approve</button>
                        <button disabled={busyId === o.id} onClick={() => decide(o.id, "reject")} className="rounded-lg border border-white/15 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-white/10 disabled:opacity-50">Reject</button>
                      </div>
                    ) : <span className="text-bota-muted">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* All orders ledger */}
      <div className="mt-6 rounded-2xl border border-white/[0.06] bg-bota-surface p-5">
        <h2 className="text-xs font-bold tracking-widest text-white">ALL ORDERS LEDGER</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/[0.06] text-[11px] tracking-widest text-bota-muted">
              <tr><th className="px-3 py-3">BUYER</th><th className="px-3 py-3">EVENT</th><th className="px-3 py-3">TIER</th><th className="px-3 py-3">TOTAL</th><th className="px-3 py-3">CODE</th><th className="px-3 py-3">STATUS</th></tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={6} className="px-3 py-10 text-center text-bota-muted">No orders yet.</td></tr>
              ) : orders.map((o) => (
                <tr key={o.id} className="border-b border-white/[0.04]">
                  <td className="px-3 py-3 font-semibold text-white">{o.buyerName}</td>
                  <td className="px-3 py-3 text-bota-text">{o.eventTitle}</td>
                  <td className="px-3 py-3 text-bota-muted">{o.tierName} ×{o.qty}</td>
                  <td className="px-3 py-3 font-bold text-bota-gold">{o.total === 0 ? "FREE" : `${o.total} ETB`}</td>
                  <td className="px-3 py-3 font-mono text-bota-muted">{o.code ?? "—"}</td>
                  <td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${statusStyle(o.status)}`}>{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
