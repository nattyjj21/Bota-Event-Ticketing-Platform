import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { ok, fail } from "@/lib/http";
import { ORDER_INCLUDE, toOrderDTO } from "@/lib/serialize";
import { commissionFor } from "@/lib/data";

export const dynamic = "force-dynamic";

/** Platform-wide view. Admin only — enforced by requireRole. */
export async function GET() {
  try {
    await requireRole("admin");

    const [orders, organizers, users, eventCount] = await Promise.all([
      prisma.order.findMany({ include: ORDER_INCLUDE, orderBy: { createdAt: "desc" } }),
      prisma.organizer.findMany({
        include: {
          user: { select: { email: true, name: true, phone: true } },
          events: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.event.count(),
    ]);

    const orderDTOs = orders.map(toOrderDTO);
    const paid = orderDTOs.filter((o) => o.status === "paid");
    const gmv = paid.reduce((a, o) => a + o.total, 0);

    // Commission ledger: paid tickets grouped by the organizer that owns the event.
    const orgIdByEvent = new Map<string, string>();
    const eventRows = await prisma.event.findMany({ select: { id: true, organizerId: true } });
    eventRows.forEach((e) => orgIdByEvent.set(e.id, e.organizerId));

    const ledgerMap = new Map<string, { organizerId: string; tickets: number; gmv: number }>();
    for (const o of paid) {
      const orgId = orgIdByEvent.get(o.eventId);
      if (!orgId) continue;
      const entry = ledgerMap.get(orgId) ?? { organizerId: orgId, tickets: 0, gmv: 0 };
      entry.tickets += o.qty;
      entry.gmv += o.total;
      ledgerMap.set(orgId, entry);
    }

    const ledger = organizers.map((org) => {
      const entry = ledgerMap.get(org.id) ?? { tickets: 0, gmv: 0 };
      return {
        id: org.id,
        businessName: org.businessName,
        email: org.user.email,
        status: org.status,
        instagram: org.instagram,
        tiktok: org.tiktok,
        createdAt: org.createdAt.toISOString(),
        events: org.events.length,
        tickets: entry.tickets,
        gmv: entry.gmv,
        commission: commissionFor(entry.gmv),
      };
    });

    return ok({
      orders: orderDTOs,
      organizers: ledger,
      users,
      stats: {
        gmv,
        commission: commissionFor(gmv),
        ticketsIssued: paid.reduce((a, o) => a + o.qty, 0),
        pendingOrgs: organizers.filter((o) => o.status === "pending").length,
        organizerCount: organizers.length,
        userCount: users.length,
        eventCount,
        orderCount: orderDTOs.length,
      },
    });
  } catch (err) {
    return fail(err);
  }
}
