import type { Metadata } from "next";
import { CartContents } from "@/components/storefront";
export const metadata: Metadata = { title: "Your bag" };
export default function CartPage() { return <main id="main-content"><CartContents/></main>; }
