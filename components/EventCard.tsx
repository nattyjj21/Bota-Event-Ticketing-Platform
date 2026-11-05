import Link from "next/link";
import { EventItem, gradientMap } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Heart } from "lucide-react";

export default function EventCard({ event }: { event: EventItem }) {
  const { wishlist, toggleWishlist } = useStore();
  const isFree = event.price === 0;
  const isWishlisted = wishlist.includes(event.id);

  return (
    <div className="event-card group relative overflow-hidden rounded-xl border border-white/[0.06] bg-bota-surface">
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(event.id);
        }}
        className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-md transition-colors hover:bg-black/60 ${isWishlisted ? "text-bota-coral" : "text-white"}`}
      >
        <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
      </button>

      <Link href={`/event/${event.slug}`} className="block">
        <div className={`relative h-[148px] overflow-hidden bg-gradient-to-br ${gradientMap[event.image] || gradientMap.nightlife}`}>
          <div className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[9px] font-bold tracking-widest text-bota-gold backdrop-blur">
            {event.category.toUpperCase()}
          </div>
          {/* subtle dot overlay */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)", backgroundSize: "22px 22px" }} />
        </div>
        <div className="p-4">
          <h3 className="font-display text-[13px] leading-tight tracking-wide text-white line-clamp-1">{event.title}</h3>
          <p className="mt-1.5 text-[11px] leading-snug text-bota-muted">{event.date}</p>
          <p className="text-[11px] leading-snug text-bota-muted line-clamp-1">{event.venue}</p>
          <div className="mt-3.5 flex items-center justify-between">
            <div>
              <div className="font-display text-[14px] tracking-wide text-bota-gold">{isFree ? "FREE" : `${event.price.toLocaleString()} ETB`}</div>
              <div className="text-[11px] text-bota-muted/70">{event.going} going</div>
            </div>
            <span className="btn-coral rounded-md bg-bota-coral px-3.5 py-2 text-[10px] font-bold tracking-wide text-[#0A0908]">
              {isFree ? "RSVP" : "Get Tickets"}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
