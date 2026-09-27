import type { Metadata } from "next";
import { CheckoutForm } from "@/components/storefront";
export const metadata: Metadata = { title: "Checkout" };
export default function CheckoutPage() { return <main id="main-content" className="page-shell"><div className="page-heading"><div className="eyebrow"><span className="eyebrow-line"/> A FEW DETAILS, THEN IT’S ON ITS WAY</div><h1>Make it <em>yours.</em></h1><p>Almost there — let’s get your order ready.</p></div><CheckoutForm/></main>; }
