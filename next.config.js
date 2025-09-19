const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  async headers() {
    const prod = process.env.NODE_ENV === "production"
    const prodHeaders = [
      {
        key: "Content-Security-Policy-Report-Only",
        value: [
          "default-src 'self'",
          // allow external Authorize.Net and minimal inline to avoid blocking framework inits
          "script-src 'self' https://js.authorize.net https://jstest.authorize.net 'unsafe-inline'",
          // explicit for some user agents
          "script-src-elem 'self' https://js.authorize.net https://jstest.authorize.net 'unsafe-inline'",
          "style-src 'self' 'unsafe-inline' https://use.typekit.net",
          "img-src 'self' data: blob:",
          "connect-src 'self' *",
          "frame-src https://js.authorize.net https://jstest.authorize.net",
          "base-uri 'self'",
          "form-action 'self'",
        ].join("; "),
      },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ]

    if (!prod) return []
    return [
      {
        source: "/:path*",
        headers: prodHeaders,
      },
    ]
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.us-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "total-hemp-consumables.s3.us-east-2.amazonaws.com",
      },
    ],
  },
}

module.exports = nextConfig
