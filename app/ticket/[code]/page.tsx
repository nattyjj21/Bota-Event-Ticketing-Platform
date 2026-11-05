"use client";
import { useParams } from "next/navigation";
import { apiGet } from "@/lib/api-client";
import type { OrderDTO } from "@/lib/data";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function TicketPage() {
  const { code } = useParams<{ code: string }>();
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!code) return;
    let mounted = true;
    apiGet<{ order: OrderDTO }>(`/api/tickets/${code}`)
      .then((d) => {
        if (mounted) {
          setOrder(d.order);
          setStatus("ready");
        }
      })
      .catch((e) => {
        if (mounted) {
          setMessage(e instanceof Error ? e.message : "Ticket not found.");
          setStatus("error");
        }
      });
    return () => {
      mounted = false;
    };
  }, [code]);

  useEffect(() => {
    if (!canvasRef.current || !order) return;
    const load = async () => {
      try {
        const QR = await import("qrcode");
        await QR.toCanvas(canvasRef.current, String(order.code ?? order.id), {
          width: 200,
          margin: 1,
          color: { dark: "#0A0908", light: "#FFFFFF" },
        });
      } catch {}
    };
    load();
  }, [order]);

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-[640px] px-4 py-14 text-center">
        <div className="h-[420px] animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.02]" />
      </div>
    );
  }

  if (status === "error" || !order) {
    return (
      <div className="mx-auto max-w-[640px] px-4 py-14 text-center">
        <div className="rounded-2xl border border-white/[0.06] bg-bota-surface p-8">
          <h1 className="font-display text-xl tracking-wide text-white">TICKET UNAVAILABLE</h1>
          <p className="mt-2 text-sm text-bota-muted">{message || "This code doesn't match a ticket on your account."}</p>
          <Link href="/tickets" className="mt-6 inline-block rounded-lg bg-white/10 px-5 py-2.5 text-xs font-bold text-white">My tickets</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[640px] px-4 py-8 sm:px-6">
      <Link href="/tickets" className="text-xs text-bota-muted hover:text-white">← My tickets</Link>
      <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.06] bg-white text-[#0A0908]">
        {/* human-readable info ABOVE QR */}
        <div className="bg-[#0A0908] px-6 py-4 text-white">
          <div className="text-[11px] font-bold tracking-widest text-bota-gold">BOTA — ADMIT ONE</div>
          <div className="mt-1 font-display text-lg tracking-wide">{order.eventTitle}</div>
          <div className="mt-1 text-xs text-white/70">{order.eventVenue} · {order.eventDate}</div>
          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-white/10 pt-3 text-xs">
            <div><div className="text-white/50">Buyer</div><div className="font-semibold text-white">{order.buyerName}</div></div>
            <div><div className="text-white/50">Purchased</div><div className="font-semibold text-white">{new Date(order.createdAt).toLocaleString()}</div></div>
            <div><div className="text-white/50">Tier</div><div className="font-semibold text-white">{order.tierName} × {order.qty}</div></div>
            <div><div className="text-white/50">Code</div><div className="font-mono font-bold text-bota-gold">{order.code ?? order.id}</div></div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3 px-6 py-6">
          {order.used && (
            <div className="w-full rounded-lg bg-amber-500/15 px-3 py-2 text-center text-[11px] font-bold text-amber-700">THIS TICKET HAS ALREADY BEEN SCANNED</div>
          )}
          <canvas ref={canvasRef} className="rounded-xl border border-black/10" />
          <p className="text-center text-[11px] text-black/50">Present this QR at the door. If the scanner is down, staff will check your name and purchase time against the printed backup list.</p>
        </div>
        <div className="flex items-center justify-between border-t border-black/10 bg-black/[0.03] px-6 py-3">
          <span className="text-[11px] font-bold tracking-widest text-black/40">BOTA EVENTS — CLAIM YOUR SPOT</span>
          <button onClick={() => window.print()} className="rounded-lg bg-[#0A0908] px-4 py-2 text-xs font-bold text-white">Print ticket</button>
        </div>
      </div>
    </div>
  );
}
