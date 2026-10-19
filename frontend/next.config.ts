import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  allowedDevOrigins: ['10.30.66.251'],
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '');

if (apiBaseUrl) {
  nextConfig.rewrites = async () => [
    {
      source: '/api/:path*',
      destination: `${apiBaseUrl}/:path*`,
    },
  ];
}

export default nextConfig;
