import type { NextConfig } from "next";

// Old thankyoumattresses.com URLs → new product pages (keeps Google rankings & shared links working)
const legacyProducts = [
  "relaxo-series",
  "royale-series",
  "adonis-ortho-bondo",
  "debonaire-softy-hardy",
  "spring-series",
  "memory-foam-series",
  "coir-series",
  "latexo-series",
  "baby-mattresses",
  "fibre-pillows-plain",
  "fibre-pillows-quilted",
  "pure-cotton-pillow",
  "memory-foam-pillow",
  "memory-contour-pillow",
  "rubber-latex-pillow",
];

/** The NestJS backend (orders, coupons, enquiries, uploaded media) */
const API_URL = process.env.API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // The dev cache kept serving stale globals.css (Tailwind theme/vars edits didn't show up); dev is fast enough without it
    turbopackFileSystemCacheForDev: false,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" }],
    localPatterns: [
      { pathname: "/images/**", search: "" },
      { pathname: "/uploads/**", search: "" },
    ],
  },
  async rewrites() {
    return {
      // After every page and route here (so /api/revalidate stays local), the rest goes to the backend
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        { source: "/api/:path*", destination: `${API_URL}/api/:path*` },
        { source: "/uploads/:path*", destination: `${API_URL}/uploads/:path*` },
      ],
    };
  },
  async redirects() {
    return [
      ...legacyProducts.map((slug) => ({ source: `/${slug}`, destination: `/product/${slug}`, permanent: true })),
      { source: "/relexo-series", destination: "/product/relaxo-series", permanent: true },
      { source: "/single-bed-mattress", destination: "/shop?category=mattress", permanent: true },
      { source: "/double-bed-mattress", destination: "/shop?category=mattress", permanent: true },
      { source: "/orthopedic-mattress", destination: "/shop?feel=Firm", permanent: true },
    ];
  },
};

export default nextConfig;
