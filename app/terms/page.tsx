import Link from "next/link";

export default function Terms() {
  return (
    <div className="mx-auto max-w-[760px] px-4 py-10 sm:px-6">
      <Link href="/" className="text-xs text-bota-muted hover:text-white">← Home</Link>
      <h1 className="mt-4 font-display text-2xl tracking-wide text-white">TERMS OF SERVICE</h1>
      <p className="mt-1 text-xs text-bota-muted">Last updated: October 2026</p>
      <div className="mt-6 space-y-5 text-sm leading-relaxed text-bota-text">
        <p>By using Bota you agree to these terms.</p>
        <div>
          <h2 className="text-sm font-bold text-white">Payments</h2>
          <p className="mt-1 text-bota-muted">All payments are made directly to the organizer via TeleBirr, CBE, or Bank of Abyssinia. Bota does not hold funds. Bota charges organizers a 2% commission on ticket sales, tracked via issued QR codes.</p>
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Tickets</h2>
          <p className="mt-1 text-bota-muted">Tickets are issued as QR codes after the organizer approves your payment. Each QR is valid for one entry. Resale is prohibited unless explicitly allowed by the organizer.</p>
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Organizers</h2>
          <p className="mt-1 text-bota-muted">Organizers must pass verification (ID + social accounts) before publishing events. Organizers are responsible for delivering the event as described.</p>
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Refunds</h2>
          <p className="mt-1 text-bota-muted">Refunds are handled between the buyer and organizer. Bota may mediate disputes but is not liable for refunds.</p>
        </div>
      </div>
    </div>
  );
}
