/** @type {import('next').NextConfig} */

const imageRemotePatterns = (process.env.NEXT_IMAGE_REMOTE_HOSTS || "")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean)
  .map((hostname) => ({
    protocol: "https",
    hostname,
  }));

const imageRemoteHosts = imageRemotePatterns.map(({ hostname }) => `https://${hostname}`);
const isDev = process.env.NODE_ENV !== "production";

const getOrigin = (value) => {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
};

const explicitConnectSources = (process.env.NEXT_PUBLIC_CONNECT_SRC || "")
  .split(",")
  .map((source) => source.trim())
  .filter(Boolean);

const connectSources = Array.from(new Set([
  "'self'",
  getOrigin(process.env.NEXT_PUBLIC_DEFAULT_URL),
  getOrigin(process.env.NEXT_PUBLIC_API_BASE_URL),
  ...explicitConnectSources,
  ...(isDev ? [
    "http://localhost:*",
    "http://127.0.0.1:*",
    "ws://localhost:*",
    "ws://127.0.0.1:*",
  ] : []),
].filter(Boolean)));

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  [
    "script-src",
    "'self'",
    "'unsafe-inline'",
    ...(isDev ? ["'unsafe-eval'"] : []),
  ].join(" "),
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  "style-src-elem 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  ["img-src", "'self'", "data:", "blob:", ...imageRemoteHosts].join(" "),
  "font-src 'self' data: https://cdn.jsdelivr.net",
  "media-src 'self' data: blob:",
  ["connect-src", ...connectSources].join(" "),
  "worker-src 'self' blob:",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), fullscreen=(self)",
  },
];

const nextConfig = {
  output: 'standalone', // Docker 빌드를 위해
  reactStrictMode: true,
  images: {
    remotePatterns: imageRemotePatterns,
  },
  // output: "standalone", // PM2 실행 시 필요
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
