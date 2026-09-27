import catalog from "@/lib/catalog.json";

export type ProductImage = { src: string; thumbnail: string; alt: string };
export type Product = {
  id: number;
  slug: string;
  name: string;
  category: string;
  categories: { name: string; slug: string }[];
  price: number;
  regularPrice: number;
  salePrice: number;
  minPrice: number;
  maxPrice: number;
  rating: number;
  reviews: number;
  inStock: boolean;
  description: string;
  shortDescription: string;
  weightOptions: string[];
  weight: string;
  images: ProductImage[];
  image: string;
  permalink: string;
  sku: string;
};

const categoryNotes: Record<string, string> = {
  "dry-fruits": "Orchard picked & sun dried",
  "sea-buckthorn-products": "The golden berry",
  "gb-honey": "Wildflower sweetness",
  "shilajit-salajeet": "From the high Himalayas",
  "walnut-kilao": "A northern tradition",
  "gb-organics": "Naturally grown in GB",
  "candies": "A little taste of home",
};
const categoryIcons: Record<string, string> = { "dry-fruits": "◉", "sea-buckthorn-products": "✳", "gb-honey": "⌁", "shilajit-salajeet": "❋", "walnut-kilao": "◌", "gb-organics": "✽", candies: "◇" };

export const categories = catalog.categories.map((category) => ({
  ...category,
  note: categoryNotes[category.slug] ?? "Sourced with care in Gilgit-Baltistan",
  icon: categoryIcons[category.slug] ?? "✳",
}));
export const products = catalog.products as Product[];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(price);
}

export function formatProductPrice(product: Product) {
  return product.minPrice !== product.maxPrice
    ? `${formatPrice(product.minPrice)} – ${formatPrice(product.maxPrice)}`
    : formatPrice(product.price);
}

export function imageUrl(image: string, _width?: number) {
  return image;
}
