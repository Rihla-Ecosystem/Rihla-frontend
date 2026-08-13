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
  async rewrites() {
    const coreApi = process.env.CORE_API_URL || "http://88.222.220.235:3005";
    return [
      {
        source: "/api/:path*",
        destination: `${coreApi}/api/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
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
