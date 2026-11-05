import { prisma } from "@/lib/prisma";
import { requireRole, ApiError } from "@/lib/auth";
import { ok, fail, requireFields } from "@/lib/http";
import { ORDER_INCLUDE, toOrderDTO } from "@/lib/serialize";

export const dynamic = "force-dynamic";

/**
 * Gate scan. Marks a code used exactly once — a second scan reports ALREADY USED.
 * Organizers can only scan tickets for their own events.
 */
export async function POST(req: Request) {
  try {
    const session = await requireRole("organizer", "admin");
    const body = await req.json();
    requireFields(body, ["code"]);

    const code = String(body.code).trim();

    const order = await prisma.order.findFirst({
      where: { OR: [{ code }, { id: code }] },
      include: { ...ORDER_INCLUDE, event: { select: { slug: true, title: true, venue: true, date: true, organizerId: true } } },
    });

    if (!order) {
      return ok({ result: "invalid", message: `INVALID — no ticket matches "${code.slice(0, 24)}"` });
    }

    if (session.role !== "admin" && order.event.organizerId !== session.orgId) {
      return ok({ result: "invalid", message: "INVALID — this ticket belongs to another organizer's event." });
    }

    if (order.status !== "paid") {
      return ok({
        result: "invalid",
        message: `INVALID — order not approved yet (status: ${order.status})`,
      });
    }

    if (order.used) {
      return ok({
        result: "used",
        message: `ALREADY USED — ${order.buyerName} · ${order.event.title.slice(0, 32)}`,
        order: toOrderDTO(order),
      });
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { used: true, usedAt: new Date() },
      include: ORDER_INCLUDE,
    });

    return ok({
      result: "valid",
      message: `VALID ✓ — ${order.buyerName} · ${order.event.title.slice(0, 32)} · ${order.tier?.name ?? ""} ×${order.qty}`,
      order: toOrderDTO(updated),
    });
  } catch (err) {
    return fail(err);
  }
}

/** Reset a ticket so it can be scanned again (organizer/admin correction tool). */
export async function DELETE(req: Request) {
  try {
    const session = await requireRole("organizer", "admin");
    const body = await req.json();
    requireFields(body, ["code"]);

    const code = String(body.code).trim();
    const order = await prisma.order.findFirst({
      where: { OR: [{ code }, { id: code }] },
      include: { event: { select: { organizerId: true, slug: true, title: true, venue: true, date: true } } },
    });
    if (!order) throw new ApiError(404, "Ticket not found.");
    if (session.role !== "admin" && order.event.organizerId !== session.orgId) {
      throw new ApiError(403, "This ticket belongs to another organizer.");
    }

    await prisma.order.update({ where: { id: order.id }, data: { used: false, usedAt: null } });
    return ok({ success: true });
  } catch (err) {
    return fail(err);
  }
}
