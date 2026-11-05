/* BOTA seed — demo accounts, organizer, events, tiers and sample orders.
 * Run with: npm run db:seed   (or: npx prisma db seed)
 * Idempotent: safe to run repeatedly.
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function chunk(len = 4) {
  let out = "";
  for (let i = 0; i < len; i++) out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  return out;
}
const ticketCode = () => `BOTA-${chunk()}-${chunk()}`;

async function main() {
  const hash = (plain) => bcrypt.hash(plain, 10);

  /* ---------------------------- demo accounts ---------------------------- */
  const admin = await prisma.user.upsert({
    where: { email: "admin@bota.et" },
    update: { role: "admin" },
    create: {
      email: "admin@bota.et",
      password: await hash("admin123"),
      name: "Bota Admin",
      phone: "0911000000",
      role: "admin",
    },
  });

  const buyer = await prisma.user.upsert({
    where: { email: "buyer@bota.et" },
    update: {},
    create: {
      email: "buyer@bota.et",
      password: await hash("buyer123"),
      name: "Test Buyer",
      phone: "0911223344",
      role: "user",
    },
  });

  // Approved organizer (gets organizer dashboard + scanner access).
  const hawassa = await prisma.user.upsert({
    where: { email: "hawassa@bota.et" },
    update: { role: "organizer" },
    create: {
      email: "hawassa@bota.et",
      password: await hash("organizer123"),
      name: "Hawassa Nights",
      phone: "0912345678",
      role: "organizer",
    },
  });

  const hawassaOrg = await prisma.organizer.upsert({
    where: { userId: hawassa.id },
    update: { status: "approved", commissionAgreed: true },
    create: {
      userId: hawassa.id,
      businessName: "Hawassa Nights Co.",
      instagram: "https://instagram.com/hawassanights",
      tiktok: "https://tiktok.com/@hawassanights",
      phone: "0912345678",
      payoutMethod: "telebirr",
      payoutAccount: "0912345678",
      status: "approved",
      commissionAgreed: true,
    },
  });

  // Pending applicant (shows up in the admin verification queue).
  const tasteUser = await prisma.user.upsert({
    where: { email: "tasteaddis@bota.et" },
    update: {},
    create: {
      email: "tasteaddis@bota.et",
      password: await hash("organizer123"),
      name: "Taste Addis",
      phone: "0913556677",
      role: "user",
    },
  });

  await prisma.organizer.upsert({
    where: { userId: tasteUser.id },
    update: {},
    create: {
      userId: tasteUser.id,
      businessName: "Taste Addis",
      instagram: "https://instagram.com/tasteaddis",
      tiktok: "https://tiktok.com/@tasteaddis",
      phone: "0913556677",
      status: "pending",
      commissionAgreed: true,
    },
  });

  /* ------------------------------- events -------------------------------- */
  const eventsSeed = [
    {
      slug: "hawassa-night-market-vol-3",
      title: "Hawassa Night Market Vol. 3",
      category: "Nightlife",
      date: "Sat, Dec 12 · 8:00 PM",
      venue: "Hawassa Lake Front",
      city: "Hawassa",
      image: "nightlife",
      description:
        "A lakeside night market with live DJs, food stalls and a bonfire. Ethiopia's biggest open-air night out.",
      tiers: [
        { name: "Early Bird", price: 250, capacity: 200, sold: 0 },
        { name: "Regular", price: 400, capacity: 400, sold: 0 },
        { name: "VIP Deck", price: 1200, capacity: 60, sold: 0 },
      ],
    },
    {
      slug: "addis-sounds-live",
      title: "Addis Sounds Live",
      category: "Music",
      date: "Fri, Dec 19 · 7:30 PM",
      venue: "Millennium Hall",
      city: "Addis Ababa",
      image: "music",
      description: "A full night of Ethiopian jazz, azmari and modern fusion from the country's best acts.",
      tiers: [
        { name: "General", price: 500, capacity: 800, sold: 0 },
        { name: "Front Row", price: 1500, capacity: 120, sold: 0 },
      ],
    },
    {
      slug: "weventure-summmit-2026",
      title: "weVenture Summit 2026",
      category: "Business",
      date: "Thu, Jan 8 · 9:00 AM",
      venue: "Skylight Hotel",
      city: "Addis Ababa",
      image: "business",
      description: "Founders, investors and operators meet for a day of talks, workshops and networking.",
      tiers: [
        { name: "Standard", price: 750, capacity: 500, sold: 0 },
        { name: "Founder Pass", price: 2000, capacity: 100, sold: 0 },
      ],
    },
    {
      slug: "taste-addis-street-food-festival",
      title: "Taste Addis Street Food Festival",
      category: "Food & Drink",
      date: "Sun, Jan 18 · 11:00 AM",
      venue: "Friendship Park",
      city: "Addis Ababa",
      image: "food",
      description: "Fifty vendors, one park, endless tibs. Bring your appetite and your friends.",
      tiers: [
        { name: "Entry", price: 0, capacity: 1000, sold: 0 },
        { name: "Tasting Pass", price: 600, capacity: 300, sold: 0 },
      ],
    },
    {
      slug: "bota-community-run",
      title: "Bota Community Run",
      category: "Community",
      date: "Sat, Jan 24 · 6:30 AM",
      venue: "Entoto Park",
      city: "Addis Ababa",
      image: "community",
      description: "A free 10K for the city. Register, get your QR, show up and run.",
      tiers: [{ name: "Free Entry", price: 0, capacity: 500, sold: 0 }],
    },
    {
      slug: "meskel-square-rooftop-sessions",
      title: "Meskel Square Rooftop Sessions",
      category: "Nightlife",
      date: "Fri, Jan 30 · 9:00 PM",
      venue: "Meskel Square Rooftop",
      city: "Addis Ababa",
      image: "nightlife",
      description: "Sunset-to-sunrise rooftop sets with the city skyline as the backdrop.",
      tiers: [
        { name: "Rooftop", price: 350, capacity: 250, sold: 0 },
        { name: "Table for 4", price: 2500, capacity: 40, sold: 0 },
      ],
    },
  ];

  const createdEvents = [];
  for (const e of eventsSeed) {
    const event = await prisma.event.upsert({
      where: { slug: e.slug },
      update: {
        title: e.title,
        category: e.category,
        date: e.date,
        venue: e.venue,
        city: e.city,
        image: e.image,
        description: e.description,
        published: true,
      },
      create: {
        slug: e.slug,
        title: e.title,
        category: e.category,
        date: e.date,
        venue: e.venue,
        city: e.city,
        image: e.image,
        description: e.description,
        published: true,
        organizerId: hawassaOrg.id,
      },
    });

    // Rebuild tiers for the event so re-seeding stays consistent.
    await prisma.ticketTier.deleteMany({ where: { eventId: event.id } });
    for (const t of e.tiers) {
      await prisma.ticketTier.create({
        data: { eventId: event.id, name: t.name, price: t.price, capacity: t.capacity, sold: 0 },
      });
    }
    createdEvents.push(event);
  }

  /* ---------------------------- sample orders ---------------------------- */
  // Only seed orders on a fresh database so we never clobber real activity.
  const orderCount = await prisma.order.count();
  if (orderCount === 0) {
    const mainEvent = createdEvents[0];
    const tiers = await prisma.ticketTier.findMany({ where: { eventId: mainEvent.id }, orderBy: { price: "asc" } });
    const regular = tiers.find((t) => t.name === "Regular") || tiers[0];
    const vip = tiers.find((t) => t.name === "VIP Deck") || tiers[tiers.length - 1];

    // 1) Paid order — QR already issued.
    const paidCode = ticketCode();
    await prisma.order.create({
      data: {
        code: paidCode,
        eventId: mainEvent.id,
        tierId: regular.id,
        userId: buyer.id,
        buyerName: "Test Buyer",
        buyerEmail: "buyer@bota.et",
        buyerPhone: "0911223344",
        qty: 2,
        total: regular.price * 2,
        status: "paid",
        method: "telebirr",
        reference: "TB-8842109",
      },
    });
    await prisma.ticketTier.update({ where: { id: regular.id }, data: { sold: { increment: 2 } } });

    // 2) Awaiting review — organizer must approve to issue a QR.
    await prisma.order.create({
      data: {
        eventId: mainEvent.id,
        tierId: vip.id,
        userId: buyer.id,
        buyerName: "Test Buyer",
        buyerEmail: "buyer@bota.et",
        buyerPhone: "0911223344",
        qty: 1,
        total: vip.price,
        status: "awaiting_review",
        method: "cbe",
        reference: "CBE-553001",
      },
    });

    // 3) Free RSVP — paid instantly with a code.
    const freeEvent = createdEvents.find((e) => e.slug === "bota-community-run");
    const freeTier = await prisma.ticketTier.findFirst({ where: { eventId: freeEvent.id } });
    await prisma.order.create({
      data: {
        code: ticketCode(),
        eventId: freeEvent.id,
        tierId: freeTier.id,
        userId: buyer.id,
        buyerName: "Test Buyer",
        buyerEmail: "buyer@bota.et",
        buyerPhone: "0911223344",
        qty: 1,
        total: 0,
        status: "paid",
      },
    });
    await prisma.ticketTier.update({ where: { id: freeTier.id }, data: { sold: { increment: 1 } } });

    console.log("Seeded 3 sample orders.");
  }

  console.log("Seed complete.");
  console.log("  Admin      : admin@bota.et / admin123");
  console.log("  Organizer  : hawassa@bota.et / organizer123");
  console.log("  Buyer      : buyer@bota.et / buyer123");
  console.log(`  (admin id ${admin.id.slice(0, 6)}…, ${createdEvents.length} events)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
