import type { NextConfig } from "next";

const isStandalone = process.env.STANDALONE === 'true';

const nextConfig: NextConfig = {
  // Force new asset URLs on every server start so browsers never serve stale chunks
  generateBuildId: async () => `build-${Date.now()}`,
  turbopack: {
    root: '.',
  },
  ...(isStandalone ? { output: 'standalone' } : {}),
  async headers() {
    return [
      {
        // Force-bust browser cache on all JS chunks so code changes
        // take effect immediately without requiring a hard reload.
        source: '/_next/static/chunks/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, max-age=0' },
          { key: 'Pragma', value: 'no-cache' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, max-age=0' },
          { key: 'Pragma', value: 'no-cache' },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;
