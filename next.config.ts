import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "@mui/material", "@mui/icons-material", "recharts"],
    turbo: {
      resolveAlias: {
        canvas: "./empty-module.ts",
      },
    },
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
      {
        source: "/app/tickets",
        destination: "/app/monuments",
        permanent: true,
      },
      {
        source: "/app/tickets/:path*",
        destination: "/app/monuments/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
