"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  categories as seedCategories,
  formatPrice,
  imageUrl,
  type Product,
} from "@/lib/products";

export function AccountPanel() {
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [message, setMessage] = useState("");
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email"));
    localStorage.setItem(
      "gb-demo-account",
      JSON.stringify({ email, name: String(data.get("name") || "") }),
    );
    setMessage(
      `Welcome${mode === "register" ? " to GB Himalayan" : " back"}! Your demo account is ready on this device.`,
    );
  }
  return (
    <main id="main-content" className="page-shell">
      <div className="page-heading">
        <div className="eyebrow" style={{ justifyContent: "center" }}>
          <span className="eyebrow-line" /> YOUR GB HIMALAYAN ACCOUNT
        </div>
        <h1>
          A warm <em>welcome.</em>
        </h1>
      </div>
      <form className="auth-card" onSubmit={submit}>
        <h1>{mode === "signin" ? "Welcome back" : "Join us"}</h1>
        <p>
          {mode === "signin"
            ? "Sign in to find your favorite things."
            : "Create an account for a little more goodness."}
        </p>
        {mode === "register" && (
          <>
            <label htmlFor="account-name">Your name</label>
            <input id="account-name" name="name" autoComplete="name" required />
          </>
        )}
        <label htmlFor="account-email">Email address</label>
        <input
          id="account-email"
          type="email"
          name="email"
          autoComplete="email"
          required
        />
        <label htmlFor="account-password">Password</label>
        <input
          id="account-password"
          type="password"
          name="password"
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          minLength={8}
          required
        />
        <button className="button button-dark" type="submit">
          {mode === "signin" ? "Sign in" : "Create account"}
          <span>→</span>
        </button>
        {message && <p role="status">{message}</p>}
        <p>
          <button
            type="button"
            className="text-link"
            onClick={() => {
              setMode(mode === "signin" ? "register" : "signin");
              setMessage("");
            }}
          >
            {mode === "signin"
              ? "New here? Create an account"
              : "Already have an account? Sign in"}
          </button>
        </p>
        <p className="checkout-note">
          Demo account only: credentials stay on this device and are not
          securely authenticated.
        </p>
      </form>
    </main>
  );
}

type AdminProduct = Product & {
  id: number;
  featured?: boolean;
  sortOrder?: number;
  stockQuantity?: number | null;
};
export function AdminPanel() {
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [adminCategories, setAdminCategories] = useState(seedCategories);
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [databaseConfigured, setDatabaseConfigured] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [message, setMessage] = useState("");
  async function loadProducts() {
    const response = await fetch("/api/admin/products");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not load products.");
    setItems(data.products);
    setAdminCategories(data.categories);
  }
  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then(async (data) => {
        setAuthenticated(data.authenticated);
        setDatabaseConfigured(data.databaseConfigured);
        if (data.authenticated && data.databaseConfigured) await loadProducts();
      })
      .catch(() => setMessage("Unable to connect to the admin service."))
      .finally(() => setReady(true));
  }, []);
  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: String(form.get("password")) }),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Sign-in failed.");
      return;
    }
    setAuthenticated(true);
    setDatabaseConfigured(data.databaseConfigured);
    if (data.databaseConfigured) {
      try {
        await loadProducts();
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Could not load products.",
        );
      }
    } else
      setMessage("Admin signed in. Configure DATABASE_URL to manage products.");
  }
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name")).trim();
    const slug = String(form.get("slug"))
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-|-$/g, "");
    const price = Number(form.get("price"));
    const stock = Number(form.get("stock"));
    const addedCategory = String(form.get("newCategory") || "").trim();
    const category =
      addedCategory
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/^-|-$/g, "") || String(form.get("category"));
    const categoryLabel = addedCategory
      ? { slug: category, name: addedCategory }
      : (adminCategories.find((item) => item.slug === category) ?? {
          slug: category,
          name: category,
        });
    const description = String(
      form.get("description") || "Made with care in Gilgit-Baltistan.",
    );
    const weight = String(form.get("weight") || "250 g");
    const image = String(form.get("image") || editing?.image || "");
    const body = {
      slug,
      name,
      sku: editing?.sku ?? "",
      category,
      categories: [categoryLabel],
      price,
      regularPrice: editing?.regularPrice ?? price,
      salePrice: editing?.salePrice ?? 0,
      minPrice: price,
      maxPrice: price,
      rating: editing?.rating ?? 0,
      reviews: editing?.reviews ?? 0,
      inStock: stock > 0,
      stockQuantity: stock,
      description,
      shortDescription: String(form.get("shortDescription") || description),
      weightOptions: weight
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      images: [{ src: image, thumbnail: image, alt: name }],
      featured: Boolean(editing?.featured),
      sortOrder: editing?.sortOrder ?? 0,
    };
    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Unable to save product.");
      return;
    }
    await loadProducts();
    setEditing(null);
    setMessage(`${name} saved to PostgreSQL.`);
    event.currentTarget.reset();
  }
  async function remove(item: AdminProduct) {
    if (!window.confirm(`Remove ${item.name}?`)) return;
    const response = await fetch(
      `/api/admin/products/${encodeURIComponent(item.slug)}`,
      { method: "DELETE" },
    );
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Unable to remove product.");
      return;
    }
    await loadProducts();
    setMessage(`${item.name} removed.`);
  }
  if (!ready)
    return (
      <main id="main-content" className="page-shell">
        <div className="skeleton" />
      </main>
    );
  if (!authenticated)
    return (
      <main id="main-content" className="page-shell">
        <div className="admin-top">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" /> SECURE SHOP MANAGEMENT
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 400,
                fontSize: 48,
              }}
            >
              A little <em>admin.</em>
            </h1>
            <p className="checkout-note">
              Sign in with the server configured admin password.
            </p>
          </div>
          <Link className="text-link" href="/products">
            View shop ↗
          </Link>
        </div>
        <form className="auth-card" onSubmit={signIn}>
          <label htmlFor="admin-password">Admin password</label>
          <input
            id="admin-password"
            type="password"
            name="password"
            autoComplete="current-password"
            required
          />
          <button className="button button-dark">
            Sign in <span>→</span>
          </button>
          {message && <p role="status">{message}</p>}
        </form>
      </main>
    );
  return (
    <main id="main-content" className="page-shell">
      <div className="admin-top">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" /> YOUR SHOP, YOUR WAY
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: 48,
            }}
          >
            A little <em>admin.</em>
          </h1>
          <p className="checkout-note">
            {databaseConfigured
              ? "Product data is saved in PostgreSQL."
              : "Set DATABASE_URL on the server to manage products."}
          </p>
        </div>
        <div>
          <Link className="text-link" href="/products">
            View shop ↗
          </Link>{" "}
          <button
            className="text-link"
            onClick={async () => {
              await fetch("/api/admin/session", { method: "DELETE" });
              setAuthenticated(false);
            }}
          >
            Sign out
          </button>
        </div>
      </div>
      {databaseConfigured && (
        <>
          <form className="admin-form" onSubmit={save}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 400,
                fontSize: 25,
              }}
            >
              {editing ? "Edit this product" : "Add a product"}
            </h2>
            <div className="form-grid">
              <label>
                Product name
                <input name="name" required defaultValue={editing?.name} />
              </label>
              <label>
                URL slug
                <input name="slug" required defaultValue={editing?.slug} />
              </label>
              <label>
                Price (PKR)
                <input
                  name="price"
                  type="number"
                  min="0"
                  required
                  defaultValue={editing?.price}
                />
              </label>
              <label>
                Stock quantity
                <input
                  name="stock"
                  type="number"
                  min="0"
                  required
                  defaultValue={
                    editing?.stockQuantity ?? (editing?.inStock ? 1 : 0)
                  }
                />
              </label>
              <label>
                Category
                <select
                  name="category"
                  defaultValue={editing?.category ?? adminCategories[0]?.slug}
                >
                  {adminCategories.map((category) => (
                    <option value={category.slug} key={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Or add category
                <input name="newCategory" placeholder="e.g. Mountain herbs" />
              </label>
              <label>
                Size / weight
                <input
                  name="weight"
                  defaultValue={editing?.weight ?? "250 g"}
                />
              </label>
              <label className="full-span">
                Image path or HTTPS URL
                <input
                  name="image"
                  required
                  defaultValue={editing?.image}
                  placeholder="/images/products/product-image.jpg"
                />
              </label>
              <label className="full-span">
                Short description
                <input
                  name="shortDescription"
                  defaultValue={editing?.shortDescription}
                />
              </label>
              <label className="full-span">
                Description
                <textarea
                  name="description"
                  rows={5}
                  defaultValue={editing?.description}
                />
              </label>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button className="button button-dark">
                {editing ? "Save changes" : "Add product"}
                <span>→</span>
              </button>
              {editing && (
                <button
                  type="button"
                  className="button"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </button>
              )}
            </div>
            {message && (
              <p role="status" className="checkout-note">
                {message}
              </p>
            )}
          </form>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Manage</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <img
                      src={imageUrl(item.image, 100)}
                      alt=""
                      width="34"
                      height="38"
                      style={{ objectFit: "cover" }}
                    />
                    {item.name}
                  </td>
                  <td>{item.categories[0]?.name ?? item.category}</td>
                  <td>{formatPrice(item.price)}</td>
                  <td>
                    {item.stockQuantity ??
                      (item.inStock ? "Available" : "Sold out")}
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(item);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        Edit
                      </button>
                      <button type="button" onClick={() => void remove(item)}>
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </main>
  );
}
