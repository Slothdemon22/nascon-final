import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // disables type checking during build
  },
  eslint: {
    ignoreDuringBuilds: true, // disables lint checking during build
  },
};

export default nextConfig;
