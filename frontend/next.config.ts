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
  allowedDevOrigins: ['10.30.66.251','10.30.73.4'],
};

const backendUrl = (process.env.BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');

nextConfig.rewrites = async () => [
    {
      source: '/backend/:path*',
      destination: `${backendUrl}/:path*`,
    },
  ];

export default nextConfig;
