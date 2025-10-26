/** @type {import('next').NextConfig} */
const nextConfig = {

  // Performance optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Image optimization
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'localhost' },
      { protocol: 'https', hostname: 'api.borsailhanos.com' },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  // Webpack optimizations (migrated to Turbopack in Next.js 16)
  // Removed webpack config for Turbopack compatibility
  
  // Output configuration (standalone removed for Next.js 16 compatibility)

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=60',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Rewrites for API (fixed WebSocket rewrite)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },

  // TypeScript configuration
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },

  // ESLint configuration (moved to next.config.ts or removed in Next.js 16)
  // No longer supported in next.config.js

  // Compression
  compress: true,

  // PoweredByHeader
  poweredByHeader: false,

  // React strict mode
  reactStrictMode: true,

  // Trailing slash
  trailingSlash: false,

  // Turbopack configuration (Next.js 16)
  // Set empty object to use Turbopack with webpack config
  experimental: {
    turbo: {},
  },
};

module.exports = nextConfig;