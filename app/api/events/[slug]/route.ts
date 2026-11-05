import { prisma } from "@/lib/prisma";
import { toEventDTO } from "@/lib/serialize";
import { ok, fail } from "@/lib/http";
import { ApiError } from "@/lib/auth";

export const dynamic = "force-dynamic";

const EVENT_INCLUDE = {
  organizer: { select: { id: true, businessName: true, status: true } },
  tiers: { orderBy: { price: "asc" as const } },
};

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  try {
    const row = await prisma.event.findUnique({
      where: { slug: params.slug },
      include: EVENT_INCLUDE,
    });
    if (!row) throw new ApiError(404, "Event not found.");
    return ok({ event: toEventDTO(row) });
  } catch (err) {
    return fail(err);
  }
}
