import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    // Keep Turbopack scoped to this workspace to avoid picking up parent lockfiles
    root: __dirname,
  },
};

export default nextConfig;
