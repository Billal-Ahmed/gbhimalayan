import { HomePageContent } from "@/components/storefront";
import { listCategories, listProducts } from "@/lib/catalog-repository";

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    listProducts(),
    listCategories(),
  ]);
  return <HomePageContent products={products} categories={categories} />;
}
