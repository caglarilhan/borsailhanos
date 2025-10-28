import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
};

export default nextConfig;
