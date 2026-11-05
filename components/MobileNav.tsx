"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Ticket, Heart } from "lucide-react";
import { useStore } from "@/lib/store";

export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useStore();

  // Signed-in organizers land on their dashboard; buyers on their tickets.
  const ticketsHref = user?.role === "organizer" || user?.role === "admin" ? "/dashboard" : "/tickets";

  const links = [
    { href: "/", label: "HOME", icon: Home },
    { href: "/clubs", label: "CLUBS", icon: Users },
    { href: ticketsHref, label: "TICKETS", icon: Ticket },
    { href: "/wishlist", label: "WISHLIST", icon: Heart },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-white/[0.06] bg-[#080706]/90 px-2 py-3 backdrop-blur-xl md:hidden">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 transition-colors ${
              active ? "text-bota-gold" : "text-bota-muted hover:text-bota-text"
            }`}
          >
            <Icon size={20} />
            <span className="text-[10px] font-bold tracking-wider">{label}</span>
          </Link>
        );
      })}
    </div>
  );
}
