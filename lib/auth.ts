import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const SESSION_COOKIE = "bota_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "bota-dev-secret-change-me"
);

export type Role = "user" | "organizer" | "admin";

export type SessionPayload = {
  uid: string;
  email: string;
  name: string;
  role: Role;
  orgId: string | null;
  orgStatus: string | null;
};

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: Role;
  organizer: {
    id: string;
    businessName: string;
    status: string;
    instagram: string | null;
    tiktok: string | null;
    payoutMethod: string | null;
    payoutAccount: string | null;
  } | null;
};

/* ------------------------------- passwords ------------------------------- */

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

/* -------------------------------- session -------------------------------- */

export async function signSession(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    return {
      uid: String(payload.uid),
      email: String(payload.email),
      name: String(payload.name),
      role: payload.role as Role,
      orgId: (payload.orgId as string | null) ?? null,
      orgStatus: (payload.orgStatus as string | null) ?? null,
    };
  } catch {
    return null;
  }
}

export async function createSession(payload: SessionPayload) {
  const token = await signSession(payload);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
}

export function destroySession() {
  cookies().delete(SESSION_COOKIE);
}

/** Reads and verifies the signed cookie. Returns null when signed out. */
export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

/** Builds the session payload (incl. organizer id/status) for a user id. */
export async function buildSessionPayload(userId: string): Promise<SessionPayload | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { organizer: true },
  });
  if (!user) return null;
  return {
    uid: user.id,
    email: user.email,
    name: user.name,
    role: user.role as Role,
    orgId: user.organizer?.id ?? null,
    orgStatus: user.organizer?.status ?? null,
  };
}

/** Full user record for the profile endpoint. */
export async function getPublicUser(userId: string): Promise<PublicUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { organizer: true },
  });
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role as Role,
    organizer: user.organizer
      ? {
          id: user.organizer.id,
          businessName: user.organizer.businessName,
          status: user.organizer.status,
          instagram: user.organizer.instagram,
          tiktok: user.organizer.tiktok,
          payoutMethod: user.organizer.payoutMethod,
          payoutAccount: user.organizer.payoutAccount,
        }
      : null,
  };
}

/* --------------------------------- guards -------------------------------- */

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Any signed-in user. */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new ApiError(401, "You must sign in to continue.");
  return session;
}

/** Signed-in user with one of the allowed roles. */
export async function requireRole(...roles: Role[]): Promise<SessionPayload> {
  const session = await requireSession();
  if (!roles.includes(session.role)) {
    throw new ApiError(403, "You do not have access to this resource.");
  }
  return session;
}
