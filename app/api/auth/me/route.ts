import { getPublicUser, getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return ok({ user: null });
    const user = await getPublicUser(session.uid);
    return ok({ user });
  } catch (err) {
    return fail(err);
  }
}
