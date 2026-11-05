import { destroySession } from "@/lib/auth";
import { ok, fail } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    destroySession();
    return ok({ success: true });
  } catch (err) {
    return fail(err);
  }
}
