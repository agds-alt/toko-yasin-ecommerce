import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  // experimental: {
  //   optimizeCss: true, // Disabled due to critters dependency issue
  // },
  // Turbopack config to avoid error
  turbopack: {},
};

export default nextConfig;
