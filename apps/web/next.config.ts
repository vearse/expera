import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  devIndicators: false,
  transpilePackages: ["@expera/shared"],
  outputFileTracingRoot: path.join(__dirname, "../.."),
  outputFileTracingIncludes: { "/**": ["./content/**/*"] },
};

export default nextConfig;
