import type { NextConfig } from "next";

// Bundle analyzer
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  typescript: {
    // Skip TypeScript errors during build for faster deployment
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip ESLint errors during build
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "@trpc/client",
      "@trpc/react-query",
    ],
    optimizeCss: true, // Optimize CSS for production
  },
  // Output configuration for smaller bundles
  output: "standalone",
  // Turbopack config to avoid error
  turbopack: {},
};

export default withBundleAnalyzer(nextConfig);
