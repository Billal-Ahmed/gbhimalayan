CREATE TABLE IF NOT EXISTS categories (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT 'Sourced with care in Gilgit-Baltistan',
  icon TEXT NOT NULL DEFAULT '✳',
  parent_slug TEXT REFERENCES categories(slug) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  sku TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  short_description TEXT NOT NULL DEFAULT '',
  primary_category_slug TEXT REFERENCES categories(slug) ON UPDATE CASCADE ON DELETE SET NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  regular_price INTEGER NOT NULL DEFAULT 0 CHECK (regular_price >= 0),
  sale_price INTEGER NOT NULL DEFAULT 0 CHECK (sale_price >= 0),
  min_price INTEGER NOT NULL DEFAULT 0 CHECK (min_price >= 0),
  max_price INTEGER NOT NULL DEFAULT 0 CHECK (max_price >= 0),
  rating NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  in_stock BOOLEAN NOT NULL DEFAULT TRUE,
  stock_quantity INTEGER CHECK (stock_quantity IS NULL OR stock_quantity >= 0),
  weight_options TEXT[] NOT NULL DEFAULT '{}',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_categories (
  product_slug TEXT NOT NULL REFERENCES products(slug) ON UPDATE CASCADE ON DELETE CASCADE,
  category_slug TEXT NOT NULL REFERENCES categories(slug) ON UPDATE CASCADE ON DELETE CASCADE,
  PRIMARY KEY (product_slug, category_slug)
);

CREATE TABLE IF NOT EXISTS product_images (
  id BIGSERIAL PRIMARY KEY,
  product_slug TEXT NOT NULL REFERENCES products(slug) ON UPDATE CASCADE ON DELETE CASCADE,
  src TEXT NOT NULL,
  thumbnail TEXT NOT NULL DEFAULT '',
  alt TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_slug, position)
);

UPDATE product_images
SET src = regexp_replace(src, '^/catalog/', '/images/products/'),
    thumbnail = regexp_replace(thumbnail, '^/catalog/', '/images/products/')
WHERE src LIKE '/catalog/%' OR thumbnail LIKE '/catalog/%';

CREATE INDEX IF NOT EXISTS products_category_idx ON products(primary_category_slug);
CREATE INDEX IF NOT EXISTS products_featured_idx ON products(featured, sort_order);
CREATE INDEX IF NOT EXISTS products_in_stock_idx ON products(in_stock);
CREATE INDEX IF NOT EXISTS product_categories_category_idx ON product_categories(category_slug);
