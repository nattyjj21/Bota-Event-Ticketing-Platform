import Link from "next/link";

export const metadata = { title: "Access denied — BOTA" };

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-[560px] px-4 py-24 text-center">
      <div className="rounded-3xl border border-white/[0.06] bg-bota-surface p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15 text-xl">🔒</div>
        <h1 className="mt-4 font-display text-2xl tracking-wide text-white">ACCESS DENIED</h1>
        <p className="mt-2 text-sm leading-relaxed text-bota-muted">
          Your account does not have permission to open this page. Admin tools are limited to admins, and the
          organizer dashboard is limited to approved organizers.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="rounded-lg bg-white/10 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/15">
            Back home
          </Link>
          <Link href="/become-organizer" className="rounded-lg bg-bota-coral px-5 py-2.5 text-xs font-bold text-[#0A0908]">
            Become an Organizer
          </Link>
        </div>
      </div>
    </div>
  );
}
