import { prisma } from "@/lib/prisma";
import { requireRole, ApiError } from "@/lib/auth";
import { ok, fail } from "@/lib/http";
import { ORDER_INCLUDE, toOrderDTO } from "@/lib/serialize";
import { ticketCode } from "@/lib/ids";

export const dynamic = "force-dynamic";

/** Approve or reject an order. Organizers may only touch orders for their own events. */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole("organizer", "admin");
    const body = await req.json();
    const action = String(body.action || "");
    if (!["approve", "reject"].includes(action)) {
      throw new ApiError(400, "Action must be 'approve' or 'reject'.");
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { event: { select: { organizerId: true } }, tier: true },
    });
    if (!order) throw new ApiError(404, "Order not found.");

    // Ownership boundary: an organizer can only act on their own events.
    if (session.role !== "admin" && order.event.organizerId !== session.orgId) {
      throw new ApiError(403, "This order belongs to another organizer.");
    }

    if (action === "reject") {
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: { status: "rejected" },
        include: ORDER_INCLUDE,
      });
      return ok({ order: toOrderDTO(updated) });
    }

    if (order.status === "paid") {
      throw new ApiError(409, "This order has already been approved.");
    }

    const code = order.code ?? ticketCode();

    const updated = await prisma.$transaction(async (tx) => {
      await tx.ticketTier.update({
        where: { id: order.tierId },
        data: { sold: { increment: order.qty } },
      });
      return tx.order.update({
        where: { id: order.id },
        data: { status: "paid", code },
        include: ORDER_INCLUDE,
      });
    });

    return ok({ order: toOrderDTO(updated) });
  } catch (err) {
    return fail(err);
  }
}
