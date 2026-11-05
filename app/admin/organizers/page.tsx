"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api-client";

type OrgRow = {
  id: string;
  businessName: string;
  email: string;
  status: string;
  events: number;
  tickets: number;
  gmv: number;
  commission: number;
};

type Overview = {
  organizers: OrgRow[];
  stats: { gmv: number; commission: number; ticketsIssued: number; organizerCount: number };
};

export default function AdminOrganizers() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    apiGet<Overview>("/api/admin/overview")
      .then((d) => { if (mounted) setData(d); })
      .catch((e) => { if (mounted) setError(e instanceof Error ? e.message : "Failed to load ledger."); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const rows = data?.organizers ?? [];
  const stats = data?.stats;
  const totalCommission = rows.reduce((a, r) => a + r.commission, 0);

  return (
    <div className="mx-auto max-w-[1220px] px-4 py-6 sm:px-6">
      <div className="flex items-baseline justify-between">
        <h1 className="font-display text-xl tracking-wide text-white">ORGANIZERS & COMMISSION LEDGER</h1>
        <Link href="/admin" className="text-xs font-bold text-bota-coral hover:underline">← Admin</Link>
      </div>
      <p className="mt-1 text-xs text-bota-muted">2% commission tracked automatically from issued QR codes. Each approved order = 1 QR = 1 paid ticket.</p>

      {error && <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-200">{error}</p>}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/[0.06] bg-bota-surface p-4">
          <div className="text-[11px] tracking-widest text-bota-muted">ORGANIZERS</div>
          <div className="mt-1 font-display text-xl tracking-wide text-white">{stats?.organizerCount ?? 0}</div>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-bota-surface p-4">
          <div className="text-[11px] tracking-widest text-bota-muted">APPROVED TICKETS</div>
          <div className="mt-1 font-display text-xl tracking-wide text-white">{stats?.ticketsIssued ?? 0}</div>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-bota-surface p-4">
          <div className="text-[11px] tracking-widest text-bota-muted">TOTAL GMV</div>
          <div className="mt-1 font-display text-xl tracking-wide text-bota-gold">{(stats?.gmv ?? 0).toLocaleString()} ETB</div>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-bota-surface p-4">
          <div className="text-[11px] tracking-widest text-bota-muted">COMMISSION OWED</div>
          <div className="mt-1 font-display text-xl tracking-wide text-bota-coral">{totalCommission.toLocaleString()} ETB</div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.06] bg-bota-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/[0.06] text-[11px] tracking-widest text-bota-muted">
              <tr>
                <th className="px-4 py-3">ORGANIZER</th>
                <th className="px-4 py-3">EVENTS</th>
                <th className="px-4 py-3">TICKETS</th>
                <th className="px-4 py-3">GMV</th>
                <th className="px-4 py-3">COMMISSION (2%)</th>
                <th className="px-4 py-3">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-bota-muted">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-bota-muted">No organizers yet.</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3"><div className="font-semibold text-white">{r.businessName}</div><div className="text-bota-muted">{r.email}</div></td>
                  <td className="px-4 py-3 text-bota-text">{r.events}</td>
                  <td className="px-4 py-3 text-bota-text">{r.tickets}</td>
                  <td className="px-4 py-3 font-bold text-bota-gold">{r.gmv.toLocaleString()} ETB</td>
                  <td className="px-4 py-3 font-bold text-bota-coral">{r.commission.toLocaleString()} ETB</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${r.status === "approved" ? "bg-emerald-500/15 text-emerald-300" : r.status === "rejected" ? "bg-red-500/15 text-red-300" : "bg-amber-500/15 text-amber-200"}`}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
            {rows.length > 0 && (
              <tfoot className="border-t border-white/[0.06] font-bold">
                <tr>
                  <td className="px-4 py-3 text-white">TOTAL</td>
                  <td className="px-4 py-3 text-white">{rows.reduce((a, r) => a + r.events, 0)}</td>
                  <td className="px-4 py-3 text-white">{rows.reduce((a, r) => a + r.tickets, 0)}</td>
                  <td className="px-4 py-3 text-bota-gold">{rows.reduce((a, r) => a + r.gmv, 0).toLocaleString()} ETB</td>
                  <td className="px-4 py-3 text-bota-coral">{totalCommission.toLocaleString()} ETB</td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
