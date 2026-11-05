import { prisma } from "@/lib/prisma";
import { requireSession, ApiError } from "@/lib/auth";
import { ok, fail, requireFields } from "@/lib/http";

export const dynamic = "force-dynamic";

/** Apply to sell tickets. Creates (or re-submits) the organizer profile as pending. */
export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const body = await req.json();
    requireFields(body, ["businessName"]);

    if (!body.commissionAgreed) {
      throw new ApiError(400, "You must agree to the 2% commission before applying.");
    }

    const existing = await prisma.organizer.findUnique({ where: { userId: session.uid } });
    if (existing && existing.status === "approved") {
      throw new ApiError(409, "Your organizer account is already approved.");
    }

    const data = {
      businessName: String(body.businessName).trim(),
      instagram: body.instagram ? String(body.instagram).trim() : null,
      tiktok: body.tiktok ? String(body.tiktok).trim() : null,
      idDocument: body.idDocument ? String(body.idDocument) : null,
      phone: body.phone ? String(body.phone).trim() : null,
      payoutMethod: body.payoutMethod ? String(body.payoutMethod) : null,
      payoutAccount: body.payoutAccount ? String(body.payoutAccount).trim() : null,
      commissionAgreed: true,
      status: "pending",
    };

    const organizer = existing
      ? await prisma.organizer.update({ where: { userId: session.uid }, data })
      : await prisma.organizer.create({ data: { ...data, userId: session.uid } });

    if (body.phone) {
      await prisma.user.update({ where: { id: session.uid }, data: { phone: String(body.phone).trim() } });
    }

    return ok({ organizer }, 201);
  } catch (err) {
    return fail(err);
  }
}
