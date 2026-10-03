import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE = "gb-admin-session";
const MAX_AGE = 60 * 60 * 12;

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("Set ADMIN_SESSION_SECRET to at least 32 characters.");
  return value;
}

function sign(value: string) { return createHmac("sha256", secret()).update(value).digest("base64url"); }

export function validAdminPassword(candidate: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error("Set ADMIN_PASSWORD in the server environment.");
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function makeAdminCookie() {
  const payload = `${Date.now() + MAX_AGE * 1000}.${crypto.randomUUID()}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminCookie(value?: string) {
  if (!value) return false;
  const parts = value.split(".");
  if (parts.length !== 3 || !/^\d+$/.test(parts[0])) return false;
  const payload = `${parts[0]}.${parts[1]}`;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(parts[2]);
  return Number(parts[0]) > Date.now() && expected.length === actual.length && timingSafeEqual(expected, actual);
}

export const adminCookieName = COOKIE;
export const adminCookieOptions = { httpOnly: true, sameSite: "strict" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: MAX_AGE };
