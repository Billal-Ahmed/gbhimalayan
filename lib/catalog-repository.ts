import "server-only";
import {
  categories as seedCategories,
  products as seedProducts,
  type Product,
  type ProductImage,
} from "@/lib/products";
import { getPool } from "@/lib/db";

type ProductInput = Omit<Product, "id"> & {
  id?: number;
  featured?: boolean;
  sortOrder?: number;
  stockQuantity?: number | null;
};
type ProductRow = Record<string, unknown>;

const productSelect = `
  SELECT p.*,
    COALESCE((SELECT jsonb_agg(jsonb_build_object('slug', c.slug, 'name', c.name) ORDER BY c.name)
      FROM product_categories pc JOIN categories c ON c.slug = pc.category_slug
      WHERE pc.product_slug = p.slug), '[]'::jsonb) AS categories,
    COALESCE((SELECT jsonb_agg(jsonb_build_object('src', i.src, 'thumbnail', i.thumbnail, 'alt', i.alt) ORDER BY i.position)
      FROM product_images i WHERE i.product_slug = p.slug), '[]'::jsonb) AS images,
    COALESCE((SELECT c.name FROM categories c WHERE c.slug = p.primary_category_slug), '') AS primary_category_name
  FROM products p`;

function mapRow(
  row: ProductRow,
): Product & {
  featured: boolean;
  sortOrder: number;
  stockQuantity: number | null;
} {
  const images = (row.images ?? []) as ProductImage[];
  return {
    id: Number(row.id),
    slug: String(row.slug),
    name: String(row.name),
    sku: String(row.sku ?? ""),
    category: String(row.primary_category_slug ?? ""),
    categories: (row.categories ?? []) as Product["categories"],
    price: Number(row.price),
    regularPrice: Number(row.regular_price),
    salePrice: Number(row.sale_price),
    minPrice: Number(row.min_price),
    maxPrice: Number(row.max_price),
    rating: Number(row.rating),
    reviews: Number(row.review_count),
    inStock: Boolean(row.in_stock),
    stockQuantity:
      row.stock_quantity == null ? null : Number(row.stock_quantity),
    weightOptions: (row.weight_options ?? []) as string[],
    weight:
      ((row.weight_options ?? []) as string[]).join(", ") || "Select size",
    description: String(row.description ?? ""),
    shortDescription: String(row.short_description ?? ""),
    images: images.map((image) => ({
      ...image,
      src: image.src.replace(/^\/catalog\//, "/images/products/"),
      thumbnail: image.thumbnail.replace(/^\/catalog\//, "/images/products/"),
    })),
    image:
      images[0]?.src.replace(/^\/catalog\//, "/images/products/") ??
      "/images/products/placeholder.svg",
    permalink: `/products/${String(row.slug)}`,
    featured: Boolean(row.featured),
    sortOrder: Number(row.sort_order),
  };
}

export async function listProducts(): Promise<
  (Product & {
    featured?: boolean;
    sortOrder?: number;
    stockQuantity?: number | null;
  })[]
> {
  const pool = getPool();
  if (!pool) return seedProducts;
  const { rows } = await pool.query(
    `${productSelect} ORDER BY p.featured DESC, p.sort_order ASC, p.created_at DESC`,
  );
  return rows.map(mapRow);
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  const pool = getPool();
  if (!pool) return seedProducts.find((product) => product.slug === slug);
  const { rows } = await pool.query(
    `${productSelect} WHERE p.slug = $1 LIMIT 1`,
    [slug],
  );
  return rows[0] ? mapRow(rows[0]) : undefined;
}

export async function listCategories(): Promise<typeof seedCategories> {
  const pool = getPool();
  if (!pool) return seedCategories;
  const { rows } = await pool.query(
    "SELECT slug, name, note, icon FROM categories ORDER BY name",
  );
  return rows as typeof seedCategories;
}

export async function upsertProduct(input: ProductInput) {
  const pool = getPool();
  if (!pool)
    throw new Error(
      "PostgreSQL is not configured. Add DATABASE_URL to the server environment.",
    );
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const category of input.categories) {
      await client.query(
        "INSERT INTO categories (slug, name) VALUES ($1, $2) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW()",
        [category.slug, category.name],
      );
    }
    const primaryCategory = input.categories[0]?.slug ?? input.category ?? null;
    const { rows } = await client.query(
      `INSERT INTO products (slug, name, sku, description, short_description, primary_category_slug, price, regular_price, sale_price, min_price, max_price, rating, review_count, in_stock, stock_quantity, weight_options, featured, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, sku=EXCLUDED.sku, description=EXCLUDED.description,
       short_description=EXCLUDED.short_description, primary_category_slug=EXCLUDED.primary_category_slug,
       price=EXCLUDED.price, regular_price=EXCLUDED.regular_price, sale_price=EXCLUDED.sale_price,
       min_price=EXCLUDED.min_price, max_price=EXCLUDED.max_price, rating=EXCLUDED.rating,
       review_count=EXCLUDED.review_count, in_stock=EXCLUDED.in_stock, stock_quantity=EXCLUDED.stock_quantity,
       weight_options=EXCLUDED.weight_options, featured=EXCLUDED.featured, sort_order=EXCLUDED.sort_order, updated_at=NOW()
       RETURNING id`,
      [
        input.slug,
        input.name,
        input.sku,
        input.description,
        input.shortDescription,
        primaryCategory,
        input.price,
        input.regularPrice,
        input.salePrice,
        input.minPrice,
        input.maxPrice,
        input.rating,
        input.reviews,
        input.inStock,
        input.stockQuantity ?? null,
        input.weightOptions,
        input.featured ?? false,
        input.sortOrder ?? 0,
      ],
    );
    await client.query(
      "DELETE FROM product_categories WHERE product_slug = $1",
      [input.slug],
    );
    for (const category of input.categories)
      await client.query(
        "INSERT INTO product_categories (product_slug, category_slug) VALUES ($1,$2) ON CONFLICT DO NOTHING",
        [input.slug, category.slug],
      );
    await client.query("DELETE FROM product_images WHERE product_slug = $1", [
      input.slug,
    ]);
    for (const [position, image] of input.images.entries())
      await client.query(
        "INSERT INTO product_images (product_slug,src,thumbnail,alt,position) VALUES ($1,$2,$3,$4,$5)",
        [input.slug, image.src, image.thumbnail, image.alt, position],
      );
    await client.query("COMMIT");
    return Number(rows[0].id);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteProduct(slug: string) {
  const pool = getPool();
  if (!pool)
    throw new Error(
      "PostgreSQL is not configured. Add DATABASE_URL to the server environment.",
    );
  const result = await pool.query("DELETE FROM products WHERE slug = $1", [
    slug,
  ]);
  return (result.rowCount ?? 0) > 0;
}
