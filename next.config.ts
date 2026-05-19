import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === "true" });

const isDev = process.env.NODE_ENV === "development";

const SUPABASE_HOST = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "gadnsdnbflexvggcghji.supabase.co";

const csp = [
  "default-src 'self'",
  `connect-src 'self' https://${SUPABASE_HOST} wss://${SUPABASE_HOST} https://*.r2.cloudflarestorage.com https://pub-*.r2.dev`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://${SUPABASE_HOST} https://*.r2.cloudflarestorage.com https://pub-*.r2.dev`,
  "media-src 'self' blob: https://*.r2.cloudflarestorage.com https://pub-*.r2.dev",
  "font-src 'self' data:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: SUPABASE_HOST },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "pub-*.r2.dev" },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
