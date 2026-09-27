import type { Metadata } from "next";
import Link from "next/link";
import { categories, products } from "@/lib/products";
import { ProductCard, ShopSort } from "@/components/storefront";

export const metadata: Metadata = { title: "Shop the collection", description: "Discover small-batch pantry and wellness goods from Gilgit-Baltistan." };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const category = typeof params.category === "string" ? params.category : "";
  const sort = typeof params.sort === "string" ? params.sort : "featured";
  const query = typeof params.q === "string" ? params.q.toLowerCase() : "";
  const minPrice = typeof params.min === "string" ? params.min : "";
  const maxPrice = typeof params.max === "string" ? params.max : "";
  const page = Math.max(1, Number(params.page) || 1);
  let results = products.filter((product) => (!category || product.categories.some((item)=>item.slug===category)) && (!query || product.name.toLowerCase().includes(query)) && (!minPrice || product.minPrice >= Number(minPrice)) && (!maxPrice || product.minPrice <= Number(maxPrice)));
  if (sort === "price-asc") results = [...results].sort((a,b)=>a.price-b.price);
  if (sort === "price-desc") results = [...results].sort((a,b)=>b.price-a.price);
  if (sort === "rating") results = [...results].sort((a,b)=>b.rating-a.rating);
  const perPage = 8;
  const shown = results.slice((page-1)*perPage,page*perPage);
  const pageCount = Math.max(1,Math.ceil(results.length/perPage));
  const activeCategory = categories.find((item)=>item.slug===category);
  return (
    <main id="main-content" className="page-shell">
      <div className="page-heading">
        <div className="eyebrow"><span className="eyebrow-line"/> CAREFULLY GATHERED, JUST FOR YOU</div>
        <h1>{activeCategory?.name ?? "The collection"}</h1>
        <p>Honest goodness from the valleys of Gilgit-Baltistan.</p>
      </div>
      <div className="shop-layout">
        <aside className="shop-sidebar">
          <details className="mobile-category-filter">
            <summary>Browse by <strong>{activeCategory?.name ?? "Everything"}</strong></summary>
            <nav className="mobile-category-options" aria-label="Product categories">
              <Link className={!category ? "active" : ""} href="/products">Everything</Link>
              {categories.map((item) => <Link className={category === item.slug ? "active" : ""} href={`/products?category=${item.slug}`} key={item.slug}>{item.name}</Link>)}
            </nav>
          </details>
          <nav className="shop-category-list" aria-label="Product categories">
            <h2>Browse by</h2>
            <Link className={!category ? "active" : ""} href="/products">Everything</Link>
            {categories.map((item) => <Link className={category === item.slug ? "active" : ""} href={`/products?category=${item.slug}`} key={item.slug}>{item.name}</Link>)}
          </nav>
          <form className="desktop-price-filter" action="/products">
            <h2>Price range</h2>
            <input type="hidden" name="category" value={category}/>
            <input type="hidden" name="sort" value={sort}/>
            <label>From <input name="min" type="number" min="0" placeholder="0" defaultValue={minPrice}/></label>
            <label>To <input name="max" type="number" min="0" placeholder="10,000" defaultValue={maxPrice}/></label>
            <button className="button button-dark">Apply</button>
          </form>
          <details className="mobile-price-filter">
            <summary>Price range</summary>
            <form className="price-filter-form" action="/products">
              <input type="hidden" name="category" value={category}/>
              <input type="hidden" name="sort" value={sort}/>
              <label>From <input name="min" type="number" min="0" placeholder="0" defaultValue={minPrice}/></label>
              <label>To <input name="max" type="number" min="0" placeholder="10,000" defaultValue={maxPrice}/></label>
              <button className="button button-dark">Apply</button>
            </form>
          </details>
        </aside>
        <section>
          <ShopSort value={sort} category={category} minPrice={minPrice} maxPrice={maxPrice}/>
          {shown.length ? <div className="product-grid shop-grid">{shown.map((product, index) => <ProductCard product={product} index={index} key={product.slug}/>)}</div> : <div className="empty-state"><h2>Nothing on this shelf just yet.</h2><p>Try another category or price range.</p></div>}
          {pageCount > 1 && <nav className="pagination" aria-label="Product pages">{Array.from({length: pageCount}, (_, index) => index + 1).map((number) => <Link className={number === page ? "current" : ""} href={`/products?${new URLSearchParams({...Object.fromEntries(Object.entries(params).filter((entry): entry is [string, string] => typeof entry[1] === "string")), page: String(number)}).toString()}`} key={number}>{number}</Link>)}</nav>}
        </section>
      </div>
    </main>
  );
}
