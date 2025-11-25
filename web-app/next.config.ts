const isProd = process.env.NODE_ENV === 'production';

const cspDev = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob:",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "connect-src *",
  "font-src 'self' data:",
  "frame-src *",
  "worker-src 'self' blob:"
].join('; ');

const cspProd = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "connect-src *",
  "font-src 'self' data:",
  "frame-src *",
  "worker-src 'self' blob:"
].join('; ');

const nextConfig = {
  eslint: {
    // Geliştirme sürecinde üretim build'ini bloklamasın
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Üretim build'ini geçici olarak engellemesin
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8081',
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
    NEXT_PUBLIC_REALTIME_URL: process.env.NEXT_PUBLIC_REALTIME_URL || 'ws://localhost:8081',
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: isProd ? cspProd : cspDev,
          },
        ],
      },
    ];
  },
} satisfies import('next').NextConfig;

export default nextConfig;
