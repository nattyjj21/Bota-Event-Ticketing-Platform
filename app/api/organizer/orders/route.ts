import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { ok, fail } from "@/lib/http";
import { ORDER_INCLUDE, toOrderDTO } from "@/lib/serialize";
import { commissionFor } from "@/lib/data";

export const dynamic = "force-dynamic";

/**
 * Orders + revenue for the signed-in organizer.
 * Admins get the full platform view. Organizers only ever see their own events.
 */
export async function GET() {
  try {
    const session = await requireRole("organizer", "admin");
    const isAdmin = session.role === "admin";

    if (!isAdmin && !session.orgId) {
      return ok({ orders: [], stats: { revenue: 0, ticketsSold: 0, pending: 0, commission: 0 }, events: [] });
    }

    const where = isAdmin ? {} : { event: { organizerId: session.orgId as string } };

    const [rows, events] = await Promise.all([
      prisma.order.findMany({ where, include: ORDER_INCLUDE, orderBy: { createdAt: "desc" } }),
      prisma.event.findMany({
        where: isAdmin ? {} : { organizerId: session.orgId as string },
        include: {
          organizer: { select: { id: true, businessName: true, status: true } },
          tiers: { orderBy: { price: "asc" } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const orders = rows.map(toOrderDTO);
    const paid = orders.filter((o) => o.status === "paid");
    const revenue = paid.reduce((a, o) => a + o.total, 0);

    return ok({
      orders,
      events,
      stats: {
        revenue,
        ticketsSold: paid.reduce((a, o) => a + o.qty, 0),
        pending: orders.filter((o) => o.status === "awaiting_review").length,
        commission: commissionFor(revenue),
      },
    });
  } catch (err) {
    return fail(err);
  }
}
