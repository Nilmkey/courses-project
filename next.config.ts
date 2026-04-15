import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone", // Для Docker
  compress: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
