import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Geçici: build esnasında lint hatalarını engelleme
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Geçici: build esnasında TS hatalarını engelleme
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
