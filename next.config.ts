import type { NextConfig } from "next";

const SECURITY_HEADERS = [
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Deny embedding in iframes (clickjacking protection)
  { key: "X-Frame-Options", value: "DENY" },
  // Limit referrer information sent to third parties
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Restrict browser feature access
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // Basic Content-Security-Policy.
  // 'unsafe-inline' is required for Tailwind/Framer Motion inline styles and
  // Next.js App Router bootstrapping scripts. For a stricter policy with
  // nonces, migrate to proxy.ts CSP as described in the Next.js CSP guide.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js requires 'unsafe-inline' + 'unsafe-eval' for dev; production
      // could drop 'unsafe-eval' but we keep parity to avoid hidden breakage.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // Tailwind/Framer Motion inline styles
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      // Allow images from Vercel Blob, Google Drive proxy, YouTube thumbnails
      "img-src 'self' blob: data: https://*.vercel-storage.com https://lh3.googleusercontent.com https://i.ytimg.com",
      // Allow fetch/XHR to same origin only
      "connect-src 'self'",
      // Allow YouTube embeds
      "frame-src https://www.youtube-nocookie.com https://www.youtube.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  devIndicators: false,
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
