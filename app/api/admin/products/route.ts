import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCookie, adminCookieName } from "@/lib/admin-auth";
import { listCategories, listProducts, upsertProduct } from "@/lib/catalog-repository";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";
const fail = (message: string, status: number) => NextResponse.json({ error: message }, { status });

export async function GET(request: NextRequest) {
  if (!verifyAdminCookie(request.cookies.get(adminCookieName)?.value)) return fail("Sign in to manage products.", 401);
  if (!getPool()) return fail("PostgreSQL is not configured. Set DATABASE_URL on the server.", 503);
  try { return NextResponse.json({ products: await listProducts(), categories: await listCategories() }); }
  catch { return fail("Could not load products from PostgreSQL.", 500); }
}

export async function POST(request: NextRequest) {
  if (!verifyAdminCookie(request.cookies.get(adminCookieName)?.value)) return fail("Sign in to manage products.", 401);
  if (!getPool()) return fail("PostgreSQL is not configured. Set DATABASE_URL on the server.", 503);
  const size = Number(request.headers.get("content-length") ?? 0);
  if (size > 1_000_000) return fail("Product data is too large.", 413);
  try {
    const p = await request.json();
    const textFields = [p.name, p.slug, p.description, p.shortDescription, p.sku];
    if (textFields.some((v) => typeof v !== "string") || p.name.trim().length < 1 || p.name.length > 180 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug) || p.slug.length > 180 || p.description.length > 20000 || p.shortDescription.length > 1000 || p.sku.length > 100) return fail("Product text fields are invalid.", 400);
    const numeric = [p.price,p.regularPrice,p.salePrice,p.minPrice,p.maxPrice,p.rating,p.reviews,p.stockQuantity,p.sortOrder];
    if (numeric.slice(0,7).some((v) => !Number.isFinite(v)) || [p.price,p.regularPrice,p.salePrice,p.minPrice,p.maxPrice,p.reviews,p.stockQuantity,p.sortOrder].some((v) => !Number.isInteger(v) || v < 0) || p.rating < 0 || p.rating > 5 || typeof p.inStock !== "boolean") return fail("Price, rating, or inventory values are invalid.", 400);
    if (!Array.isArray(p.categories) || p.categories.length < 1 || p.categories.length > 20 || p.categories.some((c: any) => !c || typeof c.name !== "string" || typeof c.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(c.slug) || c.name.length > 120)) return fail("Choose at least one valid category.", 400);
    if (!Array.isArray(p.weightOptions) || p.weightOptions.length > 30 || p.weightOptions.some((v: unknown) => typeof v !== "string" || v.length > 80) || !Array.isArray(p.images) || p.images.length > 20 || p.images.some((i: any) => !i || typeof i.src !== "string" || i.src.length > 1000 || typeof i.alt !== "string" || i.alt.length > 500 || typeof i.thumbnail !== "string" || i.thumbnail.length > 1000)) return fail("Product image or size fields are invalid.", 400);
    if (p.images.some((i: any) => !i.src.startsWith("/images/products/") && !/^https:\/\//.test(i.src))) return fail("Product images must use local product-image paths or HTTPS URLs.", 400);
    const input = { ...p, category: p.categories[0]?.slug ?? "", weight: p.weightOptions.join(", ") };
    const id = await upsertProduct(input);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return fail(error instanceof Error && error.message.includes("DATABASE_URL") ? error.message : "Unable to save product. Check the submitted values and database schema.", 400);
  }
}
