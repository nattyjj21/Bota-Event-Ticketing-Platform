import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "bota_session";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "bota-dev-secret-change-me"
);

type Role = "user" | "organizer" | "admin";

/** Route -> roles allowed to open it. Anything not listed is public. */
const RULES: { prefix: string; roles: Role[] }[] = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/dashboard", roles: ["organizer", "admin"] },
  { prefix: "/scan", roles: ["organizer", "admin"] },
  { prefix: "/tickets", roles: ["user", "organizer", "admin"] },
  { prefix: "/wishlist", roles: ["user", "organizer", "admin"] },
  { prefix: "/ticket", roles: ["user", "organizer", "admin"] },
];

async function readSession(req: NextRequest): Promise<{ role: Role } | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    return { role: payload.role as Role };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Checkout lives under /event/<slug>/checkout
  const isCheckout = /^\/event\/[^/]+\/checkout\/?$/.test(pathname);

  const rule = RULES.find((r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`));
  const protectedRoute = Boolean(rule) || isCheckout;

  const session = await readSession(req);

  // Signed-in users skip the auth screens.
  if ((pathname === "/login" || pathname === "/signup") && session) {
    const dest = session.role === "admin" ? "/admin" : session.role === "organizer" ? "/dashboard" : "/";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  if (!protectedRoute) return NextResponse.next();

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);

  if (!session) return NextResponse.redirect(loginUrl);

  if (rule && !rule.roles.includes(session.role)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
