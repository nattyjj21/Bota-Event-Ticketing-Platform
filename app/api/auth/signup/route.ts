import { prisma } from "@/lib/prisma";
import { buildSessionPayload, createSession, hashPassword, getPublicUser, ApiError } from "@/lib/auth";
import { ok, fail, isValidEmail, normalizeEmail, requireFields } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    requireFields(body, ["name", "email", "password"]);

    const name = String(body.name).trim();
    const email = normalizeEmail(String(body.email));
    const password = String(body.password);
    const phone = body.phone ? String(body.phone).trim() : null;

    if (!isValidEmail(email)) throw new ApiError(400, "Please enter a valid email address.");
    if (password.length < 6) throw new ApiError(400, "Password must be at least 6 characters.");

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new ApiError(409, "An account with this email already exists. Please sign in.");

    const user = await prisma.user.create({
      data: { name, email, phone, password: await hashPassword(password), role: "user" },
    });

    const payload = await buildSessionPayload(user.id);
    if (payload) await createSession(payload);

    return ok({ user: await getPublicUser(user.id) }, 201);
  } catch (err) {
    return fail(err);
  }
}
