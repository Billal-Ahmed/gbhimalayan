import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, categories, formatProductPrice, imageUrl, products } from "@/lib/products";
import { ProductDetailActions, ProductGallery } from "@/components/storefront";

export function generateStaticParams() { return products.map((product) => ({ slug: product.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const product = getProduct(slug);
  if (!product) return { title: "Product not found" };
  return { title: product.name, description: product.description, openGraph: { title: product.name, description: product.description, images: [imageUrl(product.image,1000)] } };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const product = getProduct(slug); if (!product) notFound();
  const category = product.categories.map((item)=>item.name).join(", ") || categories.find((item)=>item.slug===product.category)?.name;
  const jsonLd = { "@context":"https://schema.org", "@type":"Product", name:product.name, description:product.shortDescription || product.description, image:product.images.map((image)=>imageUrl(image.src,1000)), sku:product.sku || product.slug, category, offers:{ "@type":"AggregateOffer", priceCurrency:"PKR", lowPrice:product.minPrice, highPrice:product.maxPrice, availability:product.inStock?"https://schema.org/InStock":"https://schema.org/OutOfStock", url:`https://gbdigimart.com/products/${product.slug}` }, ...(product.rating>0?{aggregateRating:{ "@type":"AggregateRating", ratingValue:product.rating, reviewCount:product.reviews }}:{}) };
  return <main id="main-content" className="page-shell"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd).replace(/</g,"\\u003c")}}/><div className="detail-layout"><ProductGallery images={product.images} name={product.name}/><section className="detail-copy"><div className="eyebrow"><span className="eyebrow-line"/> {category?.toUpperCase()} · FROM GILGIT-BALTISTAN</div><h1>{product.name}</h1><div className="product-meta"><span>{product.rating>0?`★ ${product.rating.toFixed(1)} · ${product.reviews} customer ratings`:"A GB DigiMart original"}</span><span>{product.weight}</span></div><div className="detail-price">{formatProductPrice(product)}</div><p>{product.shortDescription||product.description}</p><div className="stock-note">● &nbsp; {product.inStock?"In stock · ready to ship":"Currently sold out"}</div><ProductDetailActions product={product}/><details className="product-description"><summary>About this product</summary><p>{product.description}</p></details></section></div></main>;
}
