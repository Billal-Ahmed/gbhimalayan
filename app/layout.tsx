import type { Metadata } from "next";
import { CartProvider } from "@/components/cart-provider";
import { SiteFooter, SiteHeader } from "@/components/storefront";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("http://gbhimalayan.com"),
  icons: {
    icon: "/images/brand/logo.png",
    shortcut: "/images/brand/logo.png",
    apple: "/images/brand/logo.png",
  },
  title: {
    default: "GB Himalayan — A taste of the mountains",
    template: "%s | GB Himalayan",
  },
  description:
    "Thoughtful, small-batch goodness from the valleys of Gilgit-Baltistan. Shop mountain apricots, sea buckthorn, wildflower honey and more.",
  openGraph: {
    title: "GB Himalayan — A taste of the mountains",
    description: "Small-batch goodness from the valleys of Gilgit-Baltistan.",
    siteName: "GB Himalayan",
    type: "website",
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: "GB Himalayan — A taste of the mountains",
    description: "Small-batch goodness from Gilgit-Baltistan.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <CartProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
