import { prisma } from "@/lib/prisma";
import { requireSession, ApiError } from "@/lib/auth";
import { ok, fail, requireFields, isValidEmail } from "@/lib/http";
import { ORDER_INCLUDE, toOrderDTO } from "@/lib/serialize";
import { ticketCode } from "@/lib/ids";

export const dynamic = "force-dynamic";

/** Buyer's own ticket orders. */
export async function GET() {
  try {
    const session = await requireSession();
    const rows = await prisma.order.findMany({
      where: { userId: session.uid },
      include: ORDER_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return ok({ orders: rows.map(toOrderDTO) });
  } catch (err) {
    return fail(err);
  }
}

/** Create an order. Money is transferred directly to the organizer. */
export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const body = await req.json();
    requireFields(body, ["slug", "tierId", "name", "email", "phone"]);

    const email = String(body.email).trim();
    if (!isValidEmail(email)) throw new ApiError(400, "Please enter a valid email address.");

    const qty = Math.max(1, Math.min(6, Number(body.qty) || 1));

    const event = await prisma.event.findUnique({
      where: { slug: String(body.slug) },
      include: { tiers: true },
    });
    if (!event) throw new ApiError(404, "Event not found.");

    const tier = event.tiers.find((t) => t.id === String(body.tierId));
    if (!tier) throw new ApiError(404, "Ticket type not found.");

    const remaining = tier.capacity - tier.sold;
    if (remaining < qty) throw new ApiError(409, `Only ${remaining} ticket(s) left for ${tier.name}.`);

    const total = tier.price * qty;
    const isFree = total === 0;

    if (!isFree && !String(body.reference || "").trim()) {
      throw new ApiError(400, "Please provide the transaction reference for your transfer.");
    }

    const code = isFree ? ticketCode() : null;

    const order = await prisma.$transaction(async (tx) => {
      if (isFree) {
        await tx.ticketTier.update({
          where: { id: tier.id },
          data: { sold: { increment: qty } },
        });
      }
      return tx.order.create({
        data: {
          code,
          eventId: event.id,
          tierId: tier.id,
          userId: session.uid,
          buyerName: String(body.name).trim(),
          buyerEmail: email,
          buyerPhone: String(body.phone).trim(),
          qty,
          total,
          status: isFree ? "paid" : "awaiting_review",
          reference: body.reference ? String(body.reference).trim() : null,
          method: body.method ? String(body.method) : null,
        },
        include: ORDER_INCLUDE,
      });
    });

    return ok({ order: toOrderDTO(order) }, 201);
  } catch (err) {
    return fail(err);
  }
}
