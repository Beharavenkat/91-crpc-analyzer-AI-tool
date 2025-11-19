import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
      allowedOrigins: [
        'opulent-acorn-xq6wrvgj6jx2p4xr-3000.app.github.dev',
        'localhost:3000'
      ]
    },
  },
};

export default nextConfig;
