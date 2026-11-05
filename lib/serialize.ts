import type { EventItem, OrderDTO, OrderStatus } from "./data";

/* Prisma rows -> API DTOs. Keeps the wire format stable and UI-friendly. */

type EventRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  venue: string;
  city: string;
  image: string;
  description: string;
  organizer: { id: string; businessName: string; status: string };
  tiers: { id: string; name: string; price: number; capacity: number; sold: number }[];
};

type OrderRow = {
  id: string;
  code: string | null;
  eventId: string;
  tierId: string;
  qty: number;
  total: number;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  status: string;
  reference: string | null;
  method: string | null;
  used: boolean;
  createdAt: Date;
  event?: { slug: string; title: string; venue: string; date: string } | null;
  tier?: { name: string } | null;
};

const PHOTOS = ["nightlife", "music", "food", "community", "business"];
const MAP_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15848.477694382844!2d38.4735!3d7.0504!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x17b146141c49159d%3A0x6d3c0b1f2e1a8b0a!2sEthiopia!5e0!3m2!1sen!2set!4v1700000000000!5m2!1sen!2set";

const REVIEWS = [
  { user: "Abebe K.", rating: 5, comment: "Amazing vibe, best night out in a while!", date: "2 days ago" },
  { user: "Sara M.", rating: 4, comment: "Great music, well organized entry with the QR scan.", date: "1 week ago" },
];

export function toEventDTO(row: EventRow): EventItem {
  const sold = row.tiers.reduce((a, t) => a + t.sold, 0);
  const minPrice = row.tiers.length ? Math.min(...row.tiers.map((t) => t.price)) : 0;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category as EventItem["category"],
    date: row.date,
    venue: row.venue,
    city: row.city,
    image: row.image,
    price: minPrice,
    going: sold,
    description: row.description,
    organizer: {
      id: row.organizer.id,
      name: row.organizer.businessName,
      verified: row.organizer.status === "approved",
    },
    tiers: row.tiers.map((t) => ({
      id: t.id,
      name: t.name,
      price: t.price,
      capacity: t.capacity,
      sold: t.sold,
    })),
    photos: PHOTOS,
    mapUrl: MAP_URL,
    reviews: REVIEWS,
  };
}

export function toOrderDTO(row: OrderRow): OrderDTO {
  return {
    id: row.id,
    code: row.code,
    eventId: row.eventId,
    eventSlug: row.event?.slug ?? "",
    eventTitle: row.event?.title ?? "",
    eventVenue: row.event?.venue ?? "",
    eventDate: row.event?.date ?? "",
    tierName: row.tier?.name ?? "",
    qty: row.qty,
    total: row.total,
    buyerName: row.buyerName,
    buyerEmail: row.buyerEmail,
    buyerPhone: row.buyerPhone,
    status: row.status as OrderStatus,
    reference: row.reference,
    method: row.method,
    used: row.used,
    createdAt: row.createdAt.toISOString(),
  };
}

/** Order include clause shared by every endpoint returning orders. */
export const ORDER_INCLUDE = {
  event: { select: { slug: true, title: true, venue: true, date: true } },
  tier: { select: { name: true } },
} as const;
