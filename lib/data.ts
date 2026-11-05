export type Category = "Nightlife" | "Music" | "Business" | "Food & Drink" | "Community";

export type TicketTier = {
  id: string;
  name: string;
  price: number; // ETB, 0 = free
  capacity: number;
  sold: number;
};

export type ReviewItem = { user: string; rating: number; comment: string; date: string };

export type EventItem = {
  id: string;
  slug: string;
  title: string;
  category: Category;
  date: string;
  venue: string;
  city: string;
  image: string; // gradient key
  price: number; // primary tier price for the card
  going: number; // tickets claimed
  description: string;
  organizer: { id: string; name: string; verified: boolean };
  tiers: TicketTier[];
  photos?: string[];
  mapUrl?: string;
  reviews?: ReviewItem[];
};

export type OrderStatus = "awaiting_review" | "paid" | "rejected";

export type OrderDTO = {
  id: string;
  code: string | null;
  eventId: string;
  eventSlug: string;
  eventTitle: string;
  eventVenue: string;
  eventDate: string;
  tierName: string;
  qty: number;
  total: number;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  status: OrderStatus;
  reference: string | null;
  method: string | null;
  used: boolean;
  createdAt: string;
};

export const categories: (Category | "All")[] = [
  "All",
  "Nightlife",
  "Music",
  "Business",
  "Food & Drink",
  "Community",
];

export const gradientMap: Record<string, string> = {
  nightlife: "from-[#2a1a0e] via-[#1a1208] to-[#0f0d0b]",
  music: "from-[#1a1014] via-[#14120F] to-[#0f0d0b]",
  community: "from-[#0f1a1e] via-[#121414] to-[#0f0d0b]",
  food: "from-[#1a1508] via-[#1a1208] to-[#0f0d0b]",
  business: "from-[#12141a] via-[#14120F] to-[#0f0d0b]",
};

/** 2% platform commission on every paid ticket. */
export const COMMISSION_RATE = 0.02;

export function commissionFor(amount: number) {
  return Math.round(amount * COMMISSION_RATE);
}
