import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "@mui/material", "@mui/icons-material", "recharts"],
  },
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/app",
        permanent: true,
      },
      {
        source: "/app/home",
        destination: "/app",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
