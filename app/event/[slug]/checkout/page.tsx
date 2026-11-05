"use client";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiGet, apiSend } from "@/lib/api-client";
import type { EventItem, OrderDTO } from "@/lib/data";
import Link from "next/link";

const PAYMENT_METHODS = [
  { id: "telebirr", label: "TeleBirr", acct: "0911 234 567", name: "Bota Organizer Account" },
  { id: "cbe", label: "CBE (Commercial Bank of Ethiopia)", acct: "1000 1234 5678", name: "Bota Organizer Account" },
  { id: "boa", label: "Bank of Abyssinia", acct: "2000 9876 5432", name: "Bota Organizer Account" },
];

export default function CheckoutPage() {
  const { slug } = useParams<{ slug: string }>();
  const sp = useSearchParams();
  const tierId = sp.get("tier");
  const qty = Math.max(1, Math.min(6, Number(sp.get("qty") || 1)));
  const router = useRouter();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);

  const [method, setMethod] = useState(PAYMENT_METHODS[0].id);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [reference, setReference] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState<OrderDTO | null>(null);

  useEffect(() => {
    let mounted = true;
    apiGet<{ event: EventItem }>(`/api/events/${slug}`)
      .then((d) => {
        if (mounted) setEvent(d.event);
      })
      .catch((e) => {
        if (mounted) setError(e instanceof Error ? e.message : "Event not found.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) return <div className="px-6 py-16 text-bota-muted">Loading checkout…</div>;
  if (!event) return <div className="px-6 py-16 text-bota-muted">{error ?? "Event not found."}</div>;

  const tier = event.tiers.find((t) => t.id === tierId) ?? event.tiers[0];
  const total = tier.price * qty;
  const chosen = PAYMENT_METHODS.find((m) => m.id === method)!;
  const isFree = total === 0;

  const submit = async () => {
    setError(null);
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Please fill in your name, email and phone.");
      return;
    }
    if (!isFree && !reference.trim()) {
      setError("Please provide the transaction reference for your transfer.");
      return;
    }
    setBusy(true);
    try {
      const { order: created } = await apiSend<{ order: OrderDTO }>("/api/orders", "POST", {
        slug: event.slug,
        tierId: tier.id,
        qty,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        method,
        reference: reference.trim() || fileName || undefined,
      });
      setOrder(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your order.");
    } finally {
      setBusy(false);
    }
  };

  if (order) {
    return (
      <div className="mx-auto max-w-[640px] px-4 py-14 text-center sm:px-6">
        <div className="rounded-2xl border border-white/[0.06] bg-bota-surface p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-bota-success/15 text-xl">✓</div>
          <h1 className="mt-4 font-display text-xl tracking-wide text-white">
            {isFree ? "You're in!" : "Order submitted — awaiting review"}
          </h1>
          <p className="mx-auto mt-2 max-w-[460px] text-sm leading-relaxed text-bota-muted">
            {isFree
              ? "Your free ticket is confirmed. Your QR code is ready — present it at the door."
              : "The organizer will review your payment and approve your ticket. Your QR code appears in My Tickets once approved — usually within 30 minutes."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/tickets" className="rounded-lg bg-bota-coral px-5 py-2.5 text-xs font-bold text-[#0A0908]">
              View My Tickets
            </Link>
            {order.code && (
              <Link href={`/ticket/${order.code}`} className="rounded-lg bg-white/10 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/15">
                Open my ticket
              </Link>
            )}
            <Link href="/" className="rounded-lg border border-white/10 px-5 py-2.5 text-xs font-bold text-bota-text hover:bg-white/5">
              Back to events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 sm:px-6">
      <Link href={`/event/${event.slug}`} className="text-xs text-bota-muted hover:text-white">← Back to event</Link>
      <h1 className="mt-4 font-display text-xl tracking-wide text-white">CHECKOUT — {event.title}</h1>
      <p className="text-xs text-bota-muted">{tier.name} × {qty} · {event.venue}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/[0.06] bg-bota-surface p-5">
            <h2 className="text-xs font-bold tracking-widest text-white">YOUR DETAILS</h2>
            <div className="mt-3 grid gap-3">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name *" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-bota-muted outline-none focus:border-bota-coral/50" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email *" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-bota-muted outline-none focus:border-bota-coral/50" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (e.g. 0912345678) *" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-bota-muted outline-none focus:border-bota-coral/50" />
            </div>
          </div>

          {!isFree ? (
            <div className="rounded-2xl border border-white/[0.06] bg-bota-surface p-5">
              <h2 className="text-xs font-bold tracking-widest text-white">PAY THE ORGANIZER DIRECTLY</h2>
              <p className="mt-1 text-xs text-bota-muted">Money goes straight to the organizer&apos;s own account — not through Bota.</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${method === m.id ? "border-bota-coral bg-bota-coral text-[#0A0908]" : "border-white/10 bg-black/20 text-bota-muted hover:border-white/20"}`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="mt-4 rounded-xl bg-black/30 p-4">
                <div className="text-[11px] tracking-widest text-bota-gold">{chosen.label.toUpperCase()}</div>
                <div className="mt-2 text-sm font-bold text-white">{chosen.name}</div>
                <div className="font-mono text-sm text-bota-gold">{chosen.acct}</div>
                <div className="mt-3 text-sm font-bold text-white">Amount to transfer: <span className="text-bota-gold">{total.toLocaleString()} ETB</span></div>
                <ol className="mt-3 list-decimal space-y-1 pl-5 text-xs leading-relaxed text-bota-muted">
                  <li>Open your {chosen.label} / banking app.</li>
                  <li>Transfer exactly <strong className="text-white">{total.toLocaleString()} ETB</strong> to the account above.</li>
                  <li>Keep the transaction reference or screenshot.</li>
                  <li>Enter the reference below and submit your order.</li>
                </ol>
              </div>

              <div className="mt-4">
                <label className="text-xs font-semibold text-bota-text">Attach payment screenshot (optional)</label>
                <label className="mt-1.5 flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-white/15 bg-black/20 px-4 py-6 text-center hover:border-bota-coral/40">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)} />
                  <span className="text-xs text-bota-muted">{fileName ? `Selected: ${fileName}` : "Click to upload — PNG/JPG"}</span>
                </label>
              </div>
              <div className="mt-3">
                <label className="text-xs font-semibold text-bota-text">Transaction reference *</label>
                <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. TXN123456" className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-bota-muted outline-none focus:border-bota-coral/50" />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-sm text-emerald-200">
              This is a free event — no payment needed. Just confirm your RSVP.
            </div>
          )}

          {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-200">{error}</div>}

          <button onClick={submit} disabled={busy} className="btn-coral w-full rounded-xl bg-bota-coral py-3 text-sm font-bold text-[#0A0908] disabled:opacity-50">
            {busy ? "Submitting…" : isFree ? "Confirm RSVP" : "Submit order"}
          </button>
          <p className="text-center text-[11px] text-bota-muted">Bota takes a 2% commission, settled directly with the organizer — nothing is added to your price.</p>
        </div>

        <div className="h-fit rounded-2xl border border-white/[0.06] bg-bota-surface p-5">
          <h3 className="text-xs font-bold tracking-widest text-white">ORDER SUMMARY</h3>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-bota-muted">Event</span><span className="max-w-[180px] truncate font-semibold text-white">{event.title}</span></div>
            <div className="flex justify-between"><span className="text-bota-muted">Tier</span><span className="text-white">{tier.name}</span></div>
            <div className="flex justify-between"><span className="text-bota-muted">Quantity</span><span className="text-white">× {qty}</span></div>
            <div className="flex justify-between border-t border-white/[0.06] pt-3 font-bold"><span className="text-white">Total</span><span className="text-bota-gold">{total === 0 ? "FREE" : `${total.toLocaleString()} ETB`}</span></div>
          </div>
          <div className="mt-4 rounded-lg bg-black/20 px-3 py-2.5 text-[11px] leading-relaxed text-bota-muted">
            Your ticket is issued as a QR code. Log in any time to view it under My Tickets.
          </div>
        </div>
      </div>
    </div>
  );
}
