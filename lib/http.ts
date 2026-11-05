import { NextResponse } from "next/server";
import { ApiError } from "./auth";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data as object, { status });
}

export function fail(err: unknown) {
  if (err instanceof ApiError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error("[api]", err);
  return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}

/** Small guard for required body fields. */
export function requireFields(body: Record<string, unknown>, fields: string[]) {
  const missing = fields.filter((f) => {
    const v = body[f];
    return v === undefined || v === null || String(v).trim() === "";
  });
  if (missing.length) throw new ApiError(400, `Missing required field(s): ${missing.join(", ")}`);
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}
