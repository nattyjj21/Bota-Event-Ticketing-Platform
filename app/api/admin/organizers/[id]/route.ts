import { prisma } from "@/lib/prisma";
import { requireRole, ApiError } from "@/lib/auth";
import { ok, fail } from "@/lib/http";

export const dynamic = "force-dynamic";

/** Approve or reject an organizer application. Approving promotes the user's role. */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireRole("admin");
    const body = await req.json();
    const action = String(body.action || "");
    if (!["approve", "reject", "suspend"].includes(action)) {
      throw new ApiError(400, "Action must be 'approve', 'reject' or 'suspend'.");
    }

    const organizer = await prisma.organizer.findUnique({ where: { id: params.id } });
    if (!organizer) throw new ApiError(404, "Organizer not found.");

    const status = action === "approve" ? "approved" : action === "reject" ? "rejected" : "pending";

    const updated = await prisma.$transaction(async (tx) => {
      const org = await tx.organizer.update({ where: { id: organizer.id }, data: { status } });
      // Approving grants organizer access; rejecting/suspending revokes it.
      await tx.user.update({
        where: { id: organizer.userId },
        data: { role: action === "approve" ? "organizer" : "user" },
      });
      return org;
    });

    return ok({ organizer: { id: updated.id, status: updated.status } });
  } catch (err) {
    return fail(err);
  }
}
