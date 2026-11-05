import { prisma } from "@/lib/prisma";
import { requireSession, ApiError } from "@/lib/auth";
import { ok, fail } from "@/lib/http";
import { ORDER_INCLUDE, toOrderDTO } from "@/lib/serialize";

export const dynamic = "force-dynamic";

/**
 * A single ticket. Only the buyer, the owning organizer, or an admin may read it —
 * ticket codes are never publicly enumerable.
 */
export async function GET(_req: Request, { params }: { params: { code: string } }) {
  try {
    const session = await requireSession();

    const order = await prisma.order.findFirst({
      where: { OR: [{ code: params.code }, { id: params.code }] },
      include: { ...ORDER_INCLUDE, event: { select: { slug: true, title: true, venue: true, date: true, organizerId: true } } },
    });

    if (!order) throw new ApiError(404, "Ticket not found.");

    const isOwner = order.userId === session.uid;
    const isOrganizer = session.role === "organizer" && order.event.organizerId === session.orgId;
    const isAdmin = session.role === "admin";

    if (!isOwner && !isOrganizer && !isAdmin) {
      throw new ApiError(403, "This ticket does not belong to your account.");
    }

    return ok({ order: toOrderDTO(order) });
  } catch (err) {
    return fail(err);
  }
}
