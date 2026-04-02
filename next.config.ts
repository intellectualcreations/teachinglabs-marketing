import type { NextConfig } from "next";

const isStandalone = process.env.STANDALONE === 'true';

const nextConfig: NextConfig = {
  turbopack: {
    root: '.',
  },
  ...(isStandalone ? { output: 'standalone' } : {}),
  async headers() {
    return [
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
