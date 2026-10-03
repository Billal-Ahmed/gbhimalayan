import { NextRequest, NextResponse } from "next/server";
import { adminCookieName, adminCookieOptions, makeAdminCookie, validAdminPassword, verifyAdminCookie } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return NextResponse.json({ authenticated: verifyAdminCookie(request.cookies.get(adminCookieName)?.value), databaseConfigured: Boolean(process.env.DATABASE_URL) });
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    if (typeof data.password !== "string" || data.password.length > 512 || !validAdminPassword(data.password)) return NextResponse.json({ error: "The password is incorrect." }, { status: 401 });
    const response = NextResponse.json({ authenticated: true, databaseConfigured: Boolean(process.env.DATABASE_URL) });
    response.cookies.set(adminCookieName, makeAdminCookie(), adminCookieOptions);
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to sign in." }, { status: 503 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(adminCookieName, "", { ...adminCookieOptions, maxAge: 0 });
  return response;
}
