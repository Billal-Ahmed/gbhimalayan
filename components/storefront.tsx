"use client";

import Link from "next/link";
import { useState } from "react";
import {
  categories,
  formatPrice,
  formatProductPrice,
  imageUrl,
  products,
  type Product,
  type ProductImage,
} from "@/lib/products";
import { useCart } from "@/components/cart-provider";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 5 5" />
    </svg>
  );
}
function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 8h14l1 13H4L5 8Z" />
      <path d="M9 9V6a3 3 0 0 1 6 0v3" />
    </svg>
  );
}

export function SiteHeader() {
  const { count } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <div className="announcement">
        Free home delivery nationwide <span>✦</span> Good things from
        Gilgit-Baltistan
      </div>
      <header className="site-header">
        <div className="header-inner">
          <button
            className="icon-button menu-toggle"
            aria-label="Open navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
          <Link className="brand" href="/" aria-label="GB Himalayan home">
            <img className="brand-logo" src="/images/brand/logo.png" alt="" />
          </Link>
          <nav
            className={menuOpen ? "primary-nav nav-open" : "primary-nav"}
            aria-label="Main navigation"
          >
            <Link href="/products">Shop all</Link>
            <a href="/products?category=dry-fruits">Dry fruits</a>
            <a href="/products?category=sea-buckthorn-products">
              Sea buckthorn
            </a>
            <a href="/products?category=gb-organics">GB organics</a>
          </nav>
          <div className="header-actions">
            <button
              className="icon-button"
              aria-label="Search products"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <SearchIcon />
            </button>
            <Link href="/account" className="account-link">
              Sign in
            </Link>
            <Link
              href="/cart"
              className="bag-link"
              aria-label={`Shopping bag, ${count} items`}
            >
              <BagIcon />
              <span className="bag-count">{count}</span>
            </Link>
          </div>
        </div>
        {searchOpen && (
          <form className="search-panel" action="/products">
            <label className="sr-only" htmlFor="site-search">
              Search products
            </label>
            <SearchIcon />
            <input
              id="site-search"
              name="q"
              placeholder="What are you looking for?"
              autoFocus
            />
            <button type="submit">Search</button>
          </form>
        )}
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <>
      <footer className="site-footer">
        <div className="footer-top">
          <div>
            <Link
              className="brand footer-brand"
              href="/"
              aria-label="GB Himalayan home"
            >
              <img className="brand-logo" src="/images/brand/logo.png" alt="" />
            </Link>
            <p>
              Good things grow in good places.
              <br />
              We bring the goodness of Gilgit-Baltistan to your table.
            </p>
          </div>
          <div>
            <h3>Explore</h3>
            <Link href="/products">Shop all</Link>
            <a href="/products?category=dry-fruits">Mountain pantry</a>
            <a href="/products?category=gb-organics">Natural wellness</a>
          </div>
          <div>
            <h3>Here to help</h3>
            <a href="https://wa.me/923495674412" target="_blank" rel="noopener noreferrer">Contact us</a>
            <Link href="/account">Your account</Link>
            <Link href="/cart">Your bag</Link>
          </div>
          <div>
            <h3>Stay in the loop</h3>
            <p>Seasonal finds and stories from the north.</p>
            <Newsletter compact />
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 GB Himalayan. Made with care in Pakistan.</span>
          <span>
            Thoughtfully sourced · Packed with care · Delivered with love
          </span>
        </div>
      </footer>
      <a
        className="whatsapp-fab"
        href="https://wa.me/923495674412"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with GB Himalayan on WhatsApp"
      >
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <path d="M16 3.4a12.2 12.2 0 0 0-10.4 18.6L4 28l6.2-1.6A12.2 12.2 0 1 0 16 3.4Zm0 22.1a9.9 9.9 0 0 1-5-1.4l-.4-.2-3.7 1 .9-3.6-.3-.4a9.9 9.9 0 1 1 8.5 4.6Zm5.5-7.4c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a8.1 8.1 0 0 1-2.4-1.5 9 9 0 0 1-1.6-2c-.2-.3 0-.5.2-.7l.5-.6c.2-.2.2-.4.3-.6s0-.4 0-.6-.7-1.7-1-2.3-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.2 1.2-1.2 2.8 1.2 3.2 1.4 3.4a11.2 11.2 0 0 0 4.3 3.8c.6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4s-.2-.2-.5-.3Z" />
        </svg>
        <span>Chat with us</span>
      </a>
    </>
  );
}

export function Newsletter({ compact = false }: { compact?: boolean }) {
  const [submitted, setSubmitted] = useState(false);
  return (
    <form
      className={compact ? "newsletter-form compact" : "newsletter-form"}
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <label
        className="sr-only"
        htmlFor={compact ? "footer-email" : "newsletter-email"}
      >
        Your email address
      </label>
      <input
        type="email"
        id={compact ? "footer-email" : "newsletter-email"}
        placeholder="Your email address"
        required
      />
      {!compact && (
        <button className="button button-dark">
          Join the list <span>→</span>
        </button>
      )}
      {compact && <button aria-label="Subscribe">→</button>}
      {submitted && (
        <span className="form-success">You’re on the list. Thank you!</span>
      )}
    </form>
  );
}

export function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const { addItem } = useCart();
  const onSale = product.regularPrice > product.price;
  return (
    <article
      className="product-card"
      style={{ animationDelay: `${index * 35}ms` }}
    >
      <Link className="product-image" href={`/products/${product.slug}`}>
        <img
          src={imageUrl(product.image, 640)}
          alt={product.name}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = imageUrl(
              product.images[0]?.thumbnail ??
                "/images/products/placeholder.svg",
            );
          }}
        />
        <span className="image-wash" />
        {onSale && (
          <span className="product-badge">
            -{Math.round((1 - product.price / product.regularPrice) * 100)}% ·
            SALE
          </span>
        )}
        <span className="product-arrow" aria-hidden="true">
          ↗
        </span>
      </Link>
      <div className="product-details">
        <div className="product-meta">
          <span>
            {product.categories[0]?.name ??
              categories.find((category) => category.slug === product.category)
                ?.name}
          </span>
          <span>
            {product.rating > 0 ? (
              <>
                ★ {product.rating.toFixed(1)} <i>({product.reviews})</i>
              </>
            ) : (
              "New arrival"
            )}
          </span>
        </div>
        <Link className="product-title" href={`/products/${product.slug}`}>
          {product.name}
        </Link>
        <div className="product-buy">
          <strong>{formatProductPrice(product)}</strong>
          <button
            aria-label={`Add ${product.name} to bag`}
            disabled={!product.inStock}
            onClick={() => addItem(product)}
          >
            <span>{product.inStock ? "Add to bag" : "Sold out"}</span>
            <b>+</b>
          </button>
        </div>
      </div>
    </article>
  );
}

export function HomePageContent({
  products,
  categories,
}: {
  products: Product[];
  categories: typeof import("@/lib/products").categories;
}) {
  const sortableProducts = products as (Product & { featured?: boolean })[];
  const homeProducts = [...sortableProducts].sort(
    (a, b) =>
      Number(b.inStock) - Number(a.inStock) ||
      Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
      b.reviews - a.reviews ||
      b.rating - a.rating,
  );
  const homeCategories = [
    {
      name: "Dry Fruits",
      slug: "dry-fruits",
      match: [
        "dry-fruits",
        "almonds",
        "apricot",
        "dried-figs",
        "dried-berries",
        "gb-cherries",
        "gb-mulberries",
        "jujube-dry-fruits",
        "kishmish-raisins",
        "walnuts",
        "pistachios",
        "kajucashew",
        "nuts-with-shell",
        "nuts-without-shell",
        "walnut-kilao",
      ],
    },
    {
      name: "Nuts",
      slug: "nuts",
      match: [
        "nuts-with-shell",
        "nuts-without-shell",
        "almonds",
        "kajucashew",
        "pistachios",
        "walnuts",
      ],
    },
    { name: "Kilao", slug: "walnut-kilao", match: ["walnut-kilao"] },
    {
      name: "Sea Buckthorn",
      slug: "sea-buckthorn-products",
      match: ["sea-buckthorn-products"],
    },
    { name: "GB Organics", slug: "gb-organics", match: ["gb-organics"] },
    { name: "GB Jams", slug: "gb-organic-jams", match: ["gb-organic-jams"] },
    {
      name: "Shilajit",
      slug: "shilajit-salajeet",
      match: ["shilajit-salajeet"],
    },
  ];
  const collections = [
    {
      slug: "sea-buckthorn-products",
      title:
        "Buy Pure Sea Buckthorn Products: Berries, Oil, Powder & more...",
      intro:
        "Explore pure sea buckthorn goodness, gathered and prepared in Gilgit-Baltistan.",
      match: ["sea-buckthorn-products"],
    },
    {
      slug: "shilajit-salajeet",
      title:
        "Buy GB Pure Aftabi Shilajit Online – Authentic Himalayan Shilajit",
      intro:
        "Discover authentic Himalayan Aftabi Shilajit from the mountains of GB.",
      match: ["shilajit-salajeet"],
    },
    {
      slug: "gb-honey",
      title:
        "The Pure & Organic Honey Collection",
      intro:
        "Wildflower honey collected in Gilgit-Baltistan, with the natural character of the northern valleys.",
      match: ["gb-honey"],
    },
    {
      slug: "dry-fruits",
      title: "Premium Quality Dry fruits from Gilgit-Baltistan",
      intro:
        "Shop carefully selected dry fruits, nuts and traditional Kilao from the north.",
      match: homeCategories[0].match,
    },
  ];
  const getMatches = (slugs: string[]) =>
    homeProducts.filter(
      (product) =>
        product.categories.some((category) => slugs.includes(category.slug)) ||
        slugs.includes(product.category),
    );
  return (
    <>
      <main id="main-content">
        <section className="section category-section home-category-section">
          <div className="section-heading">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-line" /> SHOP OUR MOUNTAIN PANTRY
              </div>
              <h2>
                Categories You <em>May Like</em>
              </h2>
            </div>
            <Link className="text-link" href="/products">
              View everything <span>↗</span>
            </Link>
          </div>
          <div className="category-grid">
            {homeCategories.map((category, index) => {
              const product = getMatches(category.match)[0];
              return (
                <Link
                  className={`category-card category-${index + 1}`}
                  style={{
                    backgroundImage: `linear-gradient(0deg,#252b26e8, #252b2640),url(${product?.image ?? products[0]?.image ?? "/images/products/placeholder.svg"})`,
                  }}
                  href={`/products?category=${category.slug}`}
                  key={category.slug}
                >
                  <span className="category-index">0{index + 1} / 07</span>
                  <span className="category-symbol">
                    {categories.find((item) => item.slug === category.slug)
                      ?.icon ?? "✳"}
                  </span>
                  <span className="category-copy">
                    <span>From Gilgit-Baltistan</span>
                    <strong>{category.name}</strong>
                  </span>
                  <span className="category-arrow">↗</span>
                </Link>
              );
            })}
          </div>
        </section>
        {collections.map((collection) => {
          const items = getMatches(collection.match);
          return (
            <section
              className="section home-collection"
              key={collection.slug}
              aria-labelledby={`home-${collection.slug}-heading`}
            >
              <div className="section-heading">
                <div>
                  <div className="eyebrow">
                    <span className="eyebrow-line" /> GOOD THINGS FROM THE NORTH
                  </div>
                  <h2 id={`home-${collection.slug}-heading`}>
                    {collection.title}
                  </h2>
                  <p className="home-collection-intro">{collection.intro}</p>
                </div>
                <Link
                  className="text-link"
                  href={`/products?category=${collection.slug}`}
                >
                  Shop this collection <span>↗</span>
                </Link>
              </div>
              <div className="product-grid">
                {items.slice(0, 8).map((product, index) => (
                  <ProductCard
                    key={product.slug}
                    product={product}
                    index={index}
                  />
                ))}
              </div>
            </section>
          );
        })}
        <section
          className="section bestsellers home-products"
          id="featured-products"
        >
          <div className="section-heading">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-line" /> THE COMPLETE COLLECTION
              </div>
              <h2>
                Shop all <em>products</em>
              </h2>
            </div>
            <Link className="text-link" href="/products">
              Browse filters <span>↗</span>
            </Link>
          </div>
          <div className="product-grid">
            {homeProducts.map((product, index) => (
              <ProductCard key={product.slug} product={product} index={index} />
            ))}
          </div>
        </section>
        <section className="trust-strip" aria-label="Our promises">
          <div>
            <span className="trust-icon">✳</span>
            <span>
              <strong>Rooted in the north</strong>
              <small>Sourced close to home</small>
            </span>
          </div>
          <div>
            <span className="trust-icon">⌁</span>
            <span>
              <strong>Made in small batches</strong>
              <small>Care in every detail</small>
            </span>
          </div>
          <div>
            <span className="trust-icon">↗</span>
            <span>
              <strong>Delivered with care</strong>
              <small>Across Pakistan</small>
            </span>
          </div>
          <div>
            <span className="trust-icon">♡</span>
            <span>
              <strong>Goodness you can trust</strong>
              <small>Quality, always</small>
            </span>
          </div>
        </section>
        <section className="story-band" id="our-story">
          <div className="story-image">
            <img
              src={imageUrl(
                products.find((product) => product.category === "dry-fruits")
                  ?.image ??
                  products[0]?.image ??
                  "/images/products/placeholder.svg",
                1100,
              )}
              alt="A selection of regional products from Gilgit-Baltistan"
              loading="lazy"
            />
            <span className="story-vertical">
              A PLACE WE CALL HOME · 35°55′ N
            </span>
          </div>
          <div className="story-copy">
            <div className="eyebrow">
              <span className="eyebrow-line" /> A NOTE FROM THE MOUNTAINS
            </div>
            <h2>
              Made by the
              <br />
              land we <em>love.</em>
            </h2>
            <p>
              In the high valleys of Gilgit-Baltistan, good things take their
              time. Apricots ripen slowly in the sun. Honey comes from
              wildflower meadows. Every harvest carries the care of the people
              and place behind it.
            </p>
            <p>
              We bring these honest, beautiful things a little closer to home —
              with nothing extra, just a lot of heart.
            </p>
            <Link className="text-link" href="/products">
              Get to know our makers <span>↗</span>
            </Link>
            <span className="story-flower">✳</span>
          </div>
        </section>
        <section className="quote-band">
          <span className="quote-mark">“</span>
          <p>A little taste of the north, wherever home may be.</p>
          <span>THE GB HIMALAYAN PROMISE</span>
          <i>✳</i>
        </section>
        <section className="newsletter-section">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" /> NOTES FROM THE NORTH
            </div>
            <h2>
              Good things,
              <br />
              <em>occasionally.</em>
            </h2>
            <p>
              Seasonal harvests, new arrivals and little stories from home. Only
              the good stuff.
            </p>
          </div>
          <Newsletter />
        </section>
      </main>
    </>
  );
}

export function ShopSort({
  value,
  category,
  minPrice,
  maxPrice,
}: {
  value: string;
  category: string;
  minPrice: string;
  maxPrice: string;
}) {
  return (
    <form className="shop-toolbar" action="/products">
      <span>Thoughtful finds for everyday living</span>
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="min" value={minPrice} />
      <input type="hidden" name="max" value={maxPrice} />
      <label>
        Sort by{" "}
        <select
          name="sort"
          defaultValue={value}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
        >
          <option value="featured">Featured</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="rating">Top rated</option>
        </select>
      </label>
    </form>
  );
}

export function ProductDetailActions({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  return (
    <>
      <label className="variant-label" htmlFor="weight">
        Choose your size
      </label>
      <select id="weight" defaultValue={product.weightOptions[0]}>
        {product.weightOptions.length ? (
          product.weightOptions.map((weight) => (
            <option key={weight}>{weight}</option>
          ))
        ) : (
          <option>{product.weight}</option>
        )}
      </select>
      <button
        className="button button-dark"
        disabled={!product.inStock}
        onClick={() => {
          addItem(product);
          setAdded(true);
        }}
      >
        {!product.inStock
          ? "Currently sold out"
          : added
            ? "Added to your bag ✓"
            : "Add to bag"}
        <span>→</span>
      </button>
      <div className="detail-facts">
        ✳ &nbsp; Thoughtfully sourced in Gilgit-Baltistan
        <br />⌁ &nbsp; Carefully packed and delivered across Pakistan
        <br />♡ &nbsp; Questions? We’re here to help.
      </div>
    </>
  );
}

export function ProductGallery({
  images,
  name,
}: {
  images: ProductImage[];
  name: string;
}) {
  const [selected, setSelected] = useState(images[0]);
  return (
    <div className="product-gallery">
      <div className="detail-image">
        <img
          src={imageUrl(
            selected?.src ?? "/images/products/placeholder.svg",
            1200,
          )}
          alt={selected?.alt ?? name}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = imageUrl(
              selected?.thumbnail ?? "/images/products/placeholder.svg",
            );
          }}
        />
      </div>
      {images.length > 1 && (
        <div className="gallery-thumbs" aria-label={`${name} images`}>
          {images.map((image, index) => (
            <button
              key={image.src}
              className={selected?.src === image.src ? "selected" : ""}
              onClick={() => setSelected(image)}
              aria-label={`View image ${index + 1}`}
            >
              <img src={image.thumbnail || image.src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function CartContents() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const shipping = subtotal >= 3000 || subtotal === 0 ? 0 : 250;
  const tax = Math.round(subtotal * 0.05);
  return (
    <div className="page-shell">
      <div className="page-heading">
        <div className="eyebrow">
          <span className="eyebrow-line" /> YOUR LITTLE CORNER OF THE MOUNTAINS
        </div>
        <h1>
          Your <em>bag.</em>
        </h1>
        <p>Good things are on their way.</p>
      </div>
      {items.length === 0 ? (
        <div className="empty-state">
          <h2>A little room for something lovely.</h2>
          <p>Your bag is waiting for its first mountain find.</p>
          <Link className="button button-dark" href="/products">
            Explore the collection <span>→</span>
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div>
            {items.map((item) => (
              <article className="cart-item" key={item.slug}>
                <Link href={`/products/${item.slug}`}>
                  <img src={imageUrl(item.image, 260)} alt={item.name} />
                </Link>
                <div>
                  <Link href={`/products/${item.slug}`}>
                    <h3>{item.name}</h3>
                  </Link>
                  <small>{item.weight} · Gilgit-Baltistan</small>
                  <div className="quantity-control">
                    <button
                      aria-label={`Decrease ${item.name} quantity`}
                      onClick={() =>
                        updateQuantity(item.slug, item.quantity - 1)
                      }
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      aria-label={`Increase ${item.name} quantity`}
                      onClick={() =>
                        updateQuantity(item.slug, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="cart-remove"
                    onClick={() => removeItem(item.slug)}
                  >
                    Remove
                  </button>
                </div>
                <strong>{formatPrice(item.price * item.quantity)}</strong>
              </article>
            ))}
          </div>
          <aside className="summary-card">
            <h2>A little summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span>{shipping === 0 ? "On us" : formatPrice(shipping)}</span>
            </div>
            <div className="summary-row">
              <span>Estimated tax</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatPrice(subtotal + shipping + tax)}</span>
            </div>
            <Link className="button button-dark" href="/checkout">
              Continue to checkout <span>→</span>
            </Link>
            <small>Free delivery on orders over Rs. 3,000</small>
          </aside>
        </div>
      )}
    </div>
  );
}

export function CheckoutForm() {
  const { items, subtotal } = useCart();
  const [stage, setStage] = useState(1);
  const [notice, setNotice] = useState("");
  const next = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStage((current) => Math.min(current + 1, 3));
  };
  if (!items.length)
    return (
      <div className="empty-state">
        <h2>Your bag is empty.</h2>
        <Link className="button button-dark" href="/products">
          Explore the collection <span>→</span>
        </Link>
      </div>
    );
  return (
    <div className="checkout-layout">
      <div className="checkout-steps">
        <span className={stage === 1 ? "step-active" : ""}>
          01 &nbsp; SHIPPING
        </span>
        <span>—</span>
        <span className={stage === 2 ? "step-active" : ""}>
          02 &nbsp; PAYMENT
        </span>
        <span>—</span>
        <span className={stage === 3 ? "step-active" : ""}>
          03 &nbsp; REVIEW
        </span>
      </div>
      <form
        onSubmit={
          stage === 3
            ? (event) => {
                event.preventDefault();
                setNotice(
                  "This demo checkout is ready for a secure Stripe connection. No payment was taken.",
                );
              }
            : next
        }
      >
        <section className="checkout-panel">
          <h2>
            {stage === 1
              ? "Where should we send the goodness?"
              : stage === 2
                ? "Payment details"
                : "A final look"}
          </h2>
          {stage === 1 ? (
            <div className="form-grid">
              {[
                ["First name", "firstName"],
                ["Last name", "lastName"],
                ["Email address", "email"],
                ["Phone number", "phone"],
                ["Street address", "address"],
                ["City", "city"],
                ["Postal code", "postal"],
                ["Province", "province"],
              ].map(([label, name]) => (
                <label
                  key={name}
                  className={name === "address" ? "full-span" : ""}
                >
                  {label}
                  <input
                    name={name}
                    required
                    type={name === "email" ? "email" : "text"}
                    autoComplete={name}
                  />
                </label>
              ))}
            </div>
          ) : stage === 2 ? (
            <>
              <p className="checkout-note">
                Secure card entry appears here when a Stripe account is
                connected. Card details are never collected by this demo.
              </p>
              <label className="checkout-note">
                <input type="checkbox" required /> I understand this is a
                preview checkout and no payment will be processed.
              </label>
            </>
          ) : (
            <>
              <p className="checkout-note">
                Your order includes{" "}
                {items.reduce((n, item) => n + item.quantity, 0)} lovely
                item(s), packed with care in Gilgit-Baltistan.
              </p>
              {items.map((item) => (
                <div className="summary-row" key={item.slug}>
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="summary-row total">
                <span>Order total</span>
                <span>
                  {formatPrice(
                    subtotal +
                      (subtotal >= 3000 ? 0 : 250) +
                      Math.round(subtotal * 0.05),
                  )}
                </span>
              </div>
            </>
          )}
        </section>
        <button className="button button-dark" type="submit">
          {stage === 3 ? "Place demo order" : "Continue"} <span>→</span>
        </button>
        {notice && (
          <p role="status" className="checkout-note">
            {notice}
          </p>
        )}
      </form>
    </div>
  );
}
