import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

/**
 * CSP sans nonce (variante documentée Next.js pour apps avec pages
 * statiques). Un CSP par nonce forcerait tout le rendu en dynamique
 * (cf. docs/content-security-policy.md) et casserait les pages
 * statiques (landing, fiches maisons).
 *
 * 'unsafe-inline' reste requis pour script-src : le code de base du
 * Pixel Meta est un script inline, et les pages sont pré-rendues.
 * Le reste de la policy bloque tout ce qui compte : origines de
 * scripts externes, objets, frames, formulaires, base-uri.
 */
const isDev = process.env.NODE_ENV === "development";

const cspHeader = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://connect.facebook.net`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https://drkctskvuppakycmqags.supabase.co https://images.unsplash.com https://www.facebook.com",
  "media-src 'self' blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://drkctskvuppakycmqags.supabase.co https://www.facebook.com https://connect.facebook.net https://newapi.sebpay.bj",
  "frame-src 'self' https://www.facebook.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["gsap"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "drkctskvuppakycmqags.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          ...securityHeaders,
          { key: "Content-Security-Policy", value: cspHeader },
        ],
      },
    ];
  },
};

export default nextConfig;
