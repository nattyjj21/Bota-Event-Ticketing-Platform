import { prisma } from "@/lib/prisma";
import { requireRole, ApiError } from "@/lib/auth";
import { ok, fail, requireFields } from "@/lib/http";
import { slugify } from "@/lib/ids";
import { toEventDTO } from "@/lib/serialize";

export const dynamic = "force-dynamic";

const EVENT_INCLUDE = {
  organizer: { select: { id: true, businessName: true, status: true } },
  tiers: { orderBy: { price: "asc" as const } },
};

/** Publish a new event. Only approved organizers (or admins) may sell tickets. */
export async function POST(req: Request) {
  try {
    const session = await requireRole("organizer", "admin");
    const body = await req.json();
    requireFields(body, ["title", "category", "date", "venue", "city", "description"]);

    let organizerId = session.orgId;
    if (session.role === "admin" && body.organizerId) organizerId = String(body.organizerId);
    if (!organizerId) throw new ApiError(400, "No organizer profile is linked to this account.");

    const tiersIn = Array.isArray(body.tiers) ? body.tiers : [];
    if (tiersIn.length === 0) throw new ApiError(400, "Add at least one ticket type.");

    const tiers = tiersIn.map((t: Record<string, unknown>) => ({
      name: String(t.name || "General").trim(),
      price: Math.max(0, Math.round(Number(t.price) || 0)),
      capacity: Math.max(1, Math.round(Number(t.capacity) || 1)),
    }));

    const event = await prisma.event.create({
      data: {
        slug: slugify(String(body.title)),
        title: String(body.title).trim(),
        category: String(body.category),
        date: String(body.date).trim(),
        venue: String(body.venue).trim(),
        city: String(body.city).trim(),
        image: body.image ? String(body.image) : "nightlife",
        description: String(body.description).trim(),
        organizerId,
        tiers: { create: tiers },
      },
      include: EVENT_INCLUDE,
    });

    return ok({ event: toEventDTO(event) }, 201);
  } catch (err) {
    return fail(err);
  }
}
