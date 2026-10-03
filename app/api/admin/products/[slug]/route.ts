import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCookie, adminCookieName } from "@/lib/admin-auth";
import { deleteProduct } from "@/lib/catalog-repository";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!verifyAdminCookie(request.cookies.get(adminCookieName)?.value)) return NextResponse.json({ error: "Sign in to manage products." }, { status: 401 });
  if (!getPool()) return NextResponse.json({ error: "PostgreSQL is not configured." }, { status: 503 });
  const { slug } = await params;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return NextResponse.json({ error: "Invalid product slug." }, { status: 400 });
  try { return NextResponse.json({ deleted: await deleteProduct(slug) }); }
  catch { return NextResponse.json({ error: "Unable to remove product." }, { status: 500 }); }
}
