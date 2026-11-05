import { prisma } from "@/lib/prisma";
import { buildSessionPayload, createSession, verifyPassword, getPublicUser, ApiError } from "@/lib/auth";
import { ok, fail, normalizeEmail, requireFields } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    requireFields(body, ["email", "password"]);

    const email = normalizeEmail(String(body.email));
    const password = String(body.password);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new ApiError(401, "Incorrect email or password.");

    const valid = await verifyPassword(password, user.password);
    if (!valid) throw new ApiError(401, "Incorrect email or password.");

    const payload = await buildSessionPayload(user.id);
    if (payload) await createSession(payload);

    return ok({ user: await getPublicUser(user.id) });
  } catch (err) {
    return fail(err);
  }
}
