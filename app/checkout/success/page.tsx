import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "Order received" };
export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const reference =
    typeof params.reference === "string" &&
    /^[A-Za-z0-9-]{4,32}$/.test(params.reference)
      ? params.reference
      : "Pending confirmation";
  return (
    <main id="main-content" className="page-shell">
      <div className="page-heading">
        <div className="success-mark">✓</div>
        <div className="eyebrow" style={{ justifyContent: "center" }}>
          THANK YOU FOR SHOPPING SMALL
        </div>
        <h1>
          How <em>lovely.</em>
        </h1>
        <p>
          Your order reference is <strong>{reference}</strong>
        </p>
      </div>
      <div
        className="checkout-panel"
        style={{ maxWidth: 660, margin: "0 auto 50px" }}
      >
        <h2>What happens next?</h2>
        <p className="checkout-note">
          We’ll send an order update to your email once your purchase is
          confirmed. Our team will carefully pack your mountain finds and share
          tracking details as soon as they’re on the way.
        </p>
        <p className="checkout-note">
          Need a hand?{" "}
          <a
            href="https://wa.me/923495674412"
            target="_blank"
            rel="noopener noreferrer"
          >
            Message GB Himalayan on WhatsApp
          </a>{" "}
          and include your order reference.
        </p>
        <p className="checkout-note">
          <strong>Preview store:</strong> no payment has been processed and this
          reference is not a confirmed order.
        </p>
        <Link className="button button-dark" href="/products">
          Keep exploring <span>→</span>
        </Link>
      </div>
    </main>
  );
}
