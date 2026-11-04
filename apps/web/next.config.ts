import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  devIndicators: false,
  transpilePackages: ["@expera/shared"],
  outputFileTracingRoot: path.join(__dirname, "../.."),
  outputFileTracingIncludes: { "/**": ["./content/**/*"] },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
