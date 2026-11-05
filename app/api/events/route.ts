import { prisma } from "@/lib/prisma";
import { toEventDTO } from "@/lib/serialize";
import { ok, fail } from "@/lib/http";

export const dynamic = "force-dynamic";

const EVENT_INCLUDE = {
  organizer: { select: { id: true, businessName: true, status: true } },
  tiers: { orderBy: { price: "asc" as const } },
};

export async function GET() {
  try {
    const rows = await prisma.event.findMany({
      where: { published: true },
      include: EVENT_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return ok({ events: rows.map(toEventDTO) });
  } catch (err) {
    return fail(err);
  }
}
