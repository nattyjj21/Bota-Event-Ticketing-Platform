"use client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { gradientMap, type EventItem } from "@/lib/data";
import { apiGet } from "@/lib/api-client";
import { useStore } from "@/lib/store";
import { useState, useEffect } from "react";
import { 
  MapPin, 
  Calendar, 
  Map, 
  Heart, 
  Share2, 
  Star, 
  Info, 
  CheckCircle2, 
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Camera,
  User,
  Ticket
} from "lucide-react";

export default function EventDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { wishlist, toggleWishlist } = useStore();
  const router = useRouter();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tierId, setTierId] = useState("");
  const [qty, setQty] = useState(1);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    let mounted = true;
    apiGet<{ event: EventItem }>(`/api/events/${slug}`)
      .then((d) => {
        if (!mounted) return;
        setEvent(d.event);
        setTierId(d.event.tiers[0]?.id ?? "");
      })
      .catch((e) => {
        if (mounted) setLoadError(e instanceof Error ? e.message : "Event not found.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) return <div className="mx-auto max-w-[1220px] px-6 py-16 text-bota-muted">Loading event…</div>;

  if (!event) {
    return (
      <div className="mx-auto max-w-[1220px] px-6 py-16 text-bota-muted">
        {loadError ?? "Event not found."}{" "}
        <Link href="/" className="text-bota-coral underline">Go home</Link>
      </div>
    );
  }

  const isWishlisted = wishlist.includes(event.id);
  const tier = event.tiers.find((t) => t.id === tierId) ?? event.tiers[0];
  const going = event.going;
  const total = tier.price * qty;

  const photos = event.photos?.length ? event.photos : ["nightlife", "music", "food"];

  return (
    <div className="mx-auto max-w-[1220px] pb-20 sm:px-6">
      {/* Hero Header */}
      <div className={`relative h-[400px] w-full overflow-hidden bg-gradient-to-br ${gradientMap[event.image]} sm:mt-6 sm:rounded-3xl`}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-10">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60">
              <ChevronLeft size={20} />
            </Link>
            <div className="flex gap-2">
              <button 
                onClick={() => toggleWishlist(event.id)}
                className={`flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-md transition-colors hover:bg-black/60 ${isWishlisted ? "text-bota-coral" : "text-white"}`}
              >
                <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60">
                <Share2 size={20} />
              </button>
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-full bg-black/55 px-3 py-1 text-[10px] font-bold tracking-widest text-bota-gold backdrop-blur">{event.category.toUpperCase()}</div>
              {event.organizer.verified && (
                <div className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
                  <CheckCircle2 size={12} /> Verified
                </div>
              )}
            </div>
            <h1 className="font-display text-[40px] leading-tight tracking-wide text-white sm:text-[64px]">{event.title}</h1>
            
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur-md border border-white/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bota-coral/20 text-bota-coral">
                  <MapPin size={20} />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-bota-muted">Venue Locale</div>
                  <div className="text-sm font-bold text-white">{event.venue}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur-md border border-white/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bota-gold/20 text-bota-gold">
                  <Calendar size={20} />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-bota-muted">Schedule</div>
                  <div className="text-sm font-bold text-white">{event.date.split('·')[0]}</div>
                </div>
              </div>
              <button 
                onClick={() => document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-3 rounded-2xl bg-bota-gold/20 p-3 backdrop-blur-md border border-bota-gold/20 transition-colors hover:bg-bota-gold/30"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bota-gold text-bota-surface">
                  <Map size={20} />
                </div>
                <div className="pr-2">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-bota-gold">View Map</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_0.75fr] px-4 sm:px-0">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Status Bar */}
          <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-bota-surface p-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-white">Available Now</span>
            </div>
            <div className="text-[11px] font-bold tracking-widest text-bota-muted">REF: {event.id.padStart(8, '0').toUpperCase()}</div>
          </div>

          {/* Photos */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <div className="h-0.5 w-6 bg-bota-coral"></div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-bota-text">Photos</h2>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-3xl border border-white/[0.06] bg-bota-surface">
              <div className={`h-full w-full bg-gradient-to-br ${gradientMap[photos[activePhoto]]}`}></div>
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                {photos.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActivePhoto(i)}
                    className={`h-1.5 w-1.5 rounded-full transition-all ${i === activePhoto ? "w-6 bg-bota-gold" : "bg-white/30"}`}
                  />
                ))}
              </div>
              <div className="absolute bottom-4 left-4 rounded-lg bg-black/40 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">
                <Camera size={12} className="mr-1 inline" /> {activePhoto + 1} / {photos.length}
              </div>
            </div>
          </section>

          {/* About */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <div className="h-0.5 w-6 bg-bota-gold"></div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-bota-text">About This Event</h2>
            </div>
            <div className="rounded-3xl border border-white/[0.06] bg-bota-surface p-6">
              <p className="text-sm leading-relaxed text-bota-text whitespace-pre-line">{event.description}</p>
              <div className="mt-6 flex items-center gap-4 border-t border-white/[0.06] pt-6">
                <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-bota-gold">
                  <User size={20} />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-bota-muted">Organizer</div>
                  <div className="flex items-center gap-1 text-sm font-bold text-white">
                    {event.organizer.name}
                    {event.organizer.verified && <CheckCircle2 size={14} className="text-bota-gold" />}
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-bota-muted">Going</div>
                  <div className="text-sm font-bold text-white">{going} fans</div>
                </div>
              </div>
            </div>
          </section>

          {/* Map Section */}
          <section id="map-section">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-0.5 w-6 bg-bota-coral"></div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-bota-text">Location</h2>
            </div>
            <div className="overflow-hidden rounded-3xl border border-white/[0.06] bg-bota-surface">
              {event.mapUrl ? (
                <iframe 
                  src={event.mapUrl} 
                  className="h-[300px] w-full grayscale contrast-125 opacity-70"
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy"
                ></iframe>
              ) : (
                <div className="flex h-[300px] items-center justify-center bg-white/5 text-bota-muted italic text-xs">Map view not available</div>
              )}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-bota-gold" />
                  <span className="text-xs text-bota-text">{event.venue}</span>
                </div>
                <button className="text-[10px] font-bold uppercase tracking-widest text-bota-gold hover:underline">Open in Maps</button>
              </div>
            </div>
          </section>

          {/* Reviews */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-0.5 w-6 bg-bota-gold"></div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-bota-text">Fan Reviews</h2>
              </div>
              <div className="flex items-center gap-1 text-bota-gold">
                <Star size={14} fill="currentColor" />
                <span className="text-xs font-bold">4.8</span>
                <span className="text-[10px] text-bota-muted">(24)</span>
              </div>
            </div>
            <div className="rounded-3xl border border-white/[0.06] bg-bota-surface p-6">
              <div className="mb-6 flex items-center justify-between border-b border-white/[0.06] pb-6">
                <div>
                  <div className="text-xs font-bold text-white">Your Rating</div>
                  <div className="mt-1 flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={20} className="text-white/10 cursor-pointer hover:text-bota-gold" />
                    ))}
                  </div>
                </div>
                <button className="rounded-xl bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-colors">Write Review</button>
              </div>
              
              <div className="space-y-6">
                {event.reviews?.map((r, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white">{r.user[0]}</div>
                        <span className="text-xs font-bold text-white">{r.user}</span>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, si) => (
                          <Star key={si} size={10} fill={si < r.rating ? "currentColor" : "none"} className={si < r.rating ? "text-bota-gold" : "text-white/10"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-bota-muted">{r.comment}</p>
                    <div className="text-[9px] text-white/20 uppercase tracking-widest">{r.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column - Ticket Selection (Yellow/Gold Theme) */}
        <div className="sticky top-24 h-fit">
          <div className="overflow-hidden rounded-[32px] border border-white/[0.06] bg-bota-surface shadow-2xl">
            {/* Ticket Header */}
            <div className="relative bg-bota-gold p-6 text-bota-surface">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-bota-surface/10"></div>
              <div className="absolute right-6 top-6 h-10 w-10 rounded-xl bg-bota-surface/20 flex items-center justify-center">
                <Ticket size={24} />
              </div>
              <div className="relative">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">BOTA Official Ticket</div>
                <h2 className="mt-1 font-display text-2xl tracking-wide uppercase leading-none">{event.title}</h2>
                <div className="mt-6 flex gap-6">
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-widest opacity-60">Date</div>
                    <div className="text-xs font-bold">{event.date.split('·')[0]}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-widest opacity-60">Venue</div>
                    <div className="text-xs font-bold max-w-[120px] truncate">{event.venue}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Body */}
            <div className="relative p-6">
              {/* Perforation Line */}
              <div className="absolute -top-px left-0 right-0 flex h-px items-center justify-center gap-2 px-2">
                {[...Array(30)].map((_, i) => (
                  <div key={i} className="h-px w-2 bg-bota-surface"></div>
                ))}
              </div>

              <div className="mb-6 flex items-center gap-2">
                <div className="h-0.5 w-6 bg-bota-gold"></div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-bota-muted">Choose Your Ticket</h3>
              </div>

              <div className="space-y-3">
                {event.tiers.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTierId(t.id)}
                    className={`relative w-full overflow-hidden rounded-2xl border transition-all ${
                      tierId === t.id 
                        ? "border-bota-gold bg-bota-gold/5 ring-1 ring-bota-gold" 
                        : "border-white/10 bg-black/20 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${tierId === t.id ? "border-bota-gold bg-bota-gold text-bota-surface" : "border-white/20"}`}>
                          {tierId === t.id && <div className="h-2 w-2 rounded-full bg-bota-surface"></div>}
                        </div>
                        <div className="text-left">
                          <div className={`text-xs font-bold uppercase tracking-widest ${tierId === t.id ? "text-bota-gold" : "text-white"}`}>{t.name}</div>
                          <div className="text-[10px] text-bota-muted">{t.capacity - t.sold} left</div>
                        </div>
                      </div>
                      <div className="text-sm font-display tracking-wider text-white">{t.price === 0 ? "FREE" : `${t.price} ETB`}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 space-y-4 border-t border-white/[0.06] pt-6">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-bota-muted">
                  <span>Doors Open</span>
                  <span className="text-white">10:00 PM</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-bota-muted">
                  <span>Available</span>
                  <span className="text-white">{tier.capacity - tier.sold}</span>
                </div>
              </div>

              <div className="mt-8">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white transition-colors hover:bg-white/5">-</button>
                    <span className="w-8 text-center text-sm font-bold text-white">{qty}</span>
                    <button onClick={() => setQty(q => Math.min(6, q + 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white transition-colors hover:bg-white/5">+</button>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-bota-muted">Total Amount</div>
                    <div className="font-display text-xl tracking-wider text-bota-gold">{total === 0 ? "FREE" : `${total.toLocaleString()} ETB`}</div>
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/event/${event.slug}/checkout?tier=${tierId}&qty=${qty}`)}
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-bota-gold py-4 text-xs font-bold uppercase tracking-[0.2em] text-bota-surface transition-transform active:scale-95"
                >
                  {tier.price === 0 ? "RSVP — Free" : "Get Tickets"}
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 flex justify-between border-t border-white/[0.06] pt-6">
                <div className="flex flex-col items-center gap-1 opacity-40">
                  <CheckCircle2 size={14} />
                  <span className="text-[8px] font-bold uppercase tracking-widest">Secure</span>
                </div>
                <div className="flex flex-col items-center gap-1 opacity-40">
                  <Star size={14} />
                  <span className="text-[8px] font-bold uppercase tracking-widest">Verified</span>
                </div>
                <div className="flex flex-col items-center gap-1 opacity-40">
                  <Info size={14} />
                  <span className="text-[8px] font-bold uppercase tracking-widest">Instant</span>
                </div>
              </div>

              {/* Bottom Decoration */}
              <div className="mt-8 flex flex-col items-center opacity-10">
                <div className="flex h-6 w-full items-end gap-0.5 overflow-hidden">
                  {[...Array(40)].map((_, i) => (
                    <div key={i} className="w-1 bg-white" style={{ height: `${Math.random() * 100}%` }}></div>
                  ))}
                </div>
                <div className="mt-2 text-[8px] font-mono tracking-widest">BOTA #{event.id.padStart(8, '0').toUpperCase()}</div>
              </div>
            </div>
          </div>
          <p className="mt-4 px-4 text-center text-[10px] leading-relaxed text-bota-muted">
            All sales are final. Tickets are issued instantly after payment confirmation by the organizer.
          </p>
        </div>
      </div>
    </div>
  );
}
