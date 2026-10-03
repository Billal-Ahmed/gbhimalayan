import { readFile } from "node:fs/promises";
import pg from "pg";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL before seeding the catalog.");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: true } : undefined });
const catalog = JSON.parse(await readFile(new URL("../lib/catalog.json", import.meta.url), "utf8"));
const schema = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");

try {
  await pool.query(schema);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const category of catalog.categories) await client.query("INSERT INTO categories(slug,name) VALUES($1,$2) ON CONFLICT(slug) DO NOTHING", [category.slug, category.name]);
    for (const product of catalog.products) {
      for (const category of product.categories) await client.query("INSERT INTO categories(slug,name) VALUES($1,$2) ON CONFLICT(slug) DO NOTHING", [category.slug, category.name]);
      const categorySlug = product.categories[0]?.slug ?? null;
      const inserted = await client.query(`INSERT INTO products(slug,name,sku,description,short_description,primary_category_slug,price,regular_price,sale_price,min_price,max_price,rating,review_count,in_stock,stock_quantity,weight_options,featured,sort_order)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
        ON CONFLICT(slug) DO NOTHING RETURNING slug`, [product.slug,product.name,product.sku??"",product.description,product.shortDescription,categorySlug,product.price,product.regularPrice,product.salePrice,product.minPrice,product.maxPrice,product.rating,product.reviews,product.inStock,product.inStock?10:0,product.weightOptions,product.id===2999||product.id===2977,product.id]);
      if (!inserted.rowCount) continue;
      for (const category of product.categories) await client.query("INSERT INTO product_categories(product_slug,category_slug) VALUES($1,$2) ON CONFLICT DO NOTHING", [product.slug,category.slug]);
      for (const [position,image] of product.images.entries()) await client.query("INSERT INTO product_images(product_slug,src,thumbnail,alt,position) VALUES($1,$2,$3,$4,$5)", [product.slug,image.src,image.thumbnail,image.alt,position]);
    }
    await client.query(`UPDATE products SET
      description = regexp_replace(regexp_replace(description, 'gbdigimart\\.com', 'gbhimalayan.com', 'gi'), 'GB[[:space:]-]*Digi[[:space:]-]*Mart', 'GB Himalayan', 'gi'),
      short_description = regexp_replace(regexp_replace(short_description, 'gbdigimart\\.com', 'gbhimalayan.com', 'gi'), 'GB[[:space:]-]*Digi[[:space:]-]*Mart', 'GB Himalayan', 'gi')
      WHERE description ~* 'gbdigimart\\.com|GB[[:space:]-]*Digi[[:space:]-]*Mart'
         OR short_description ~* 'gbdigimart\\.com|GB[[:space:]-]*Digi[[:space:]-]*Mart'`);
    await client.query("COMMIT");
    console.log(`Imported any missing catalog rows from ${catalog.products.length} products and ${catalog.categories.length} categories; existing admin edits were preserved.`);
  } catch (error) { await client.query("ROLLBACK"); throw error; }
  finally { client.release(); }
} finally { await pool.end(); }
