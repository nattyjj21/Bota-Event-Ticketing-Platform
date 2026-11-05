import Link from "next/link";

export default function Privacy() {
  return (
    <div className="mx-auto max-w-[760px] px-4 py-10 sm:px-6">
      <Link href="/" className="text-xs text-bota-muted hover:text-white">← Home</Link>
      <h1 className="mt-4 font-display text-2xl tracking-wide text-white">PRIVACY POLICY</h1>
      <p className="mt-1 text-xs text-bota-muted">Last updated: October 2026</p>
      <div className="mt-6 space-y-5 text-sm leading-relaxed text-bota-text">
        <p>Bota (&quot;we&quot;, &quot;us&quot;) operates the Bota event marketplace. This policy explains what data we collect and how we use it.</p>
        <div>
          <h2 className="text-sm font-bold text-white">Information we collect</h2>
          <p className="mt-1 text-bota-muted">Account details (name, email, phone), payment references you submit for manual transfers, and verification documents (ID / social links) for organizers.</p>
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">How we use it</h2>
          <p className="mt-1 text-bota-muted">To issue tickets, verify organizers, process the 2% commission ledger, and prevent fraud. We do not store full card details — payments go directly to the organizer&apos;s own account.</p>
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Sharing</h2>
          <p className="mt-1 text-bota-muted">We share your name and ticket code with the event organizer for check-in. We do not sell your data.</p>
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Contact</h2>
          <p className="mt-1 text-bota-muted">For privacy requests, email privacy@bota.et.</p>
        </div>
      </div>
    </div>
  );
}
