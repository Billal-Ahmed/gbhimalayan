import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/catalog/:path*", destination: "/images/products/:path*", permanent: true },
      { source: "/logo.png", destination: "/images/brand/logo.png", permanent: true },
      { source: "/logo.jpeg", destination: "/images/brand/legacy/logo.jpeg", permanent: true },
      { source: "/logo.jpg", destination: "/images/brand/legacy/logo.jpg", permanent: true },
      { source: "/gb-digimart-logo.png", destination: "/images/brand/legacy/gb-digimart-logo.png", permanent: true },
    ];
  },
};

export default nextConfig;
