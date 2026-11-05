"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiSend } from "@/lib/api-client";
import Link from "next/link";

type ScanResult = { result: "valid" | "used" | "invalid"; message: string };

export default function ScanPage() {
  const [manual, setManual] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [busy, setBusy] = useState(false);
  const readerRef = useRef<any>(null);
  const lastRef = useRef<{ code: string; at: number }>({ code: "", at: 0 });

  const check = useCallback(async (raw: string) => {
    const code = raw.trim();
    if (!code) return;
    // Ignore the same code scanned twice within 2.5s (camera fires repeatedly).
    const now = Date.now();
    if (lastRef.current.code === code && now - lastRef.current.at < 2500) return;
    lastRef.current = { code, at: now };

    setBusy(true);
    try {
      const res = await apiSend<ScanResult>("/api/scan", "POST", { code });
      setResult(res);
    } catch (e) {
      setResult({ result: "invalid", message: e instanceof Error ? e.message : "Scan failed." });
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        const qr = new Html5Qrcode("bota-qr-reader");
        readerRef.current = qr;
        await qr.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 220 },
          (decoded: string) => { if (mounted) check(decoded); },
          () => {}
        );
      } catch {}
    };
    init();
    return () => {
      mounted = false;
      try { readerRef.current?.stop()?.catch(() => {}); } catch {}
    };
  }, [check]);

  const reset = async () => {
    const code = manual.trim() || lastRef.current.code;
    if (!code) return;
    try {
      await apiSend("/api/scan", "DELETE", { code });
      setResult({ result: "valid", message: `RESET — "${code}" can be scanned again.` });
    } catch (e) {
      setResult({ result: "invalid", message: e instanceof Error ? e.message : "Reset failed." });
    }
  };

  return (
    <div className="mx-auto max-w-[720px] px-4 py-6 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl tracking-wide text-white">GATE SCANNER</h1>
        <Link href="/dashboard" className="text-xs font-bold text-bota-coral hover:underline">← Dashboard</Link>
      </div>
      <p className="mt-1 text-xs text-bota-muted">Camera scan or enter a code manually. VALID marks the ticket used instantly — a second scan shows ALREADY USED.</p>

      {result && (
        <div className={`mt-4 rounded-2xl border p-4 text-center text-sm font-bold ${result.result === "valid" ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200" : result.result === "used" ? "border-amber-500/40 bg-amber-500/15 text-amber-200" : "border-red-500/40 bg-red-500/15 text-red-200"}`}>
          {result.message}
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.06] bg-black">
        <div id="bota-qr-reader" className="min-h-[260px] bg-black" />
      </div>

      <div className="mt-6 rounded-2xl border border-white/[0.06] bg-bota-surface p-5">
        <h2 className="text-xs font-bold tracking-widest text-white">MANUAL CODE ENTRY (FALLBACK)</h2>
        <div className="mt-3 flex gap-2">
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && check(manual)}
            placeholder="Paste ticket code (e.g. BOTA-XXXX-XXXX)"
            className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 font-mono text-sm text-white placeholder:text-bota-muted outline-none"
          />
          <button disabled={busy} onClick={() => check(manual)} className="rounded-lg bg-bota-coral px-5 py-2.5 text-xs font-bold text-[#0A0908] disabled:opacity-50">Check</button>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button onClick={reset} className="text-xs text-bota-muted underline">Reset a ticket (undo a scan)</button>
          <span className="text-xs text-bota-muted/50">· Scanner requires camera permission.</span>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-black/30 px-4 py-3 text-[11px] leading-relaxed text-bota-muted">
        Backup if the scanner fails: use the printed backup list from the organizer dashboard and the buyer&apos;s name / purchase time printed above the QR on their ticket screen.
      </div>
    </div>
  );
}
