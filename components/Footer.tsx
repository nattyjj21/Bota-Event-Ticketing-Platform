import Link from "next/link";
import { Globe, Users, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#0A0908] pb-12 pt-16 md:pb-16">
      <div className="mx-auto max-w-[1220px] px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Logo & Intro */}
          <div className="space-y-6">
            <Link href="/" className="font-display text-[24px] tracking-[0.08em] text-bota-coral">BOTA</Link>
            <p className="max-w-[280px] text-xs leading-relaxed text-bota-muted">
              The high performance ticketing engine for live entertainment in Ethiopia. Discover, book, and enjoy.
            </p>
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-bota-text">Need help?</span>
              <Link href="/contact" className="text-sm font-bold text-bota-coral hover:underline">Contact us</Link>
            </div>
            <div className="flex gap-4">
              <Link href="#" className="text-bota-muted transition-colors hover:text-white"><Globe size={18} /></Link>
              <Link href="#" className="text-bota-muted transition-colors hover:text-white"><Users size={18} /></Link>
              <Link href="#" className="text-bota-muted transition-colors hover:text-white"><Mail size={18} /></Link>
            </div>
          </div>

          {/* Discover */}
          <div>
            <h4 className="mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white">Discover</h4>
            <ul className="space-y-3 text-[12px] font-medium text-bota-muted">
              <li><Link href="/#events" className="hover:text-white transition-colors">Events</Link></li>
              <li><Link href="/clubs" className="hover:text-white transition-colors">Venues</Link></li>
              <li><Link href="/clubs" className="hover:text-white transition-colors">Artists</Link></li>
              <li><Link href="/#events" className="hover:text-white transition-colors">Festivals</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white">Company</h4>
            <ul className="space-y-3 text-[12px] font-medium text-bota-muted">
              <li><Link href="/about" className="hover:text-white transition-colors">Our Story</Link></li>
              <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/press" className="hover:text-white transition-colors">Press</Link></li>
              <li><Link href="/become-organizer" className="hover:text-white transition-colors">Become an Organizer</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white">Support</h4>
            <ul className="space-y-3 text-[12px] font-medium text-bota-muted">
              <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between border-t border-white/[0.06] pt-8 gap-4 md:flex-row">
          <span className="text-[11px] text-bota-muted/40 uppercase tracking-widest">© 2026 Bota Events. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <span className="text-[11px] text-bota-muted/40 uppercase tracking-widest">Made in Ethiopia</span>
            <div className="flex h-6 w-px bg-white/5"></div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-bota-muted">
              <Mail size={12} className="text-bota-coral" />
              hello@bota.et
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
