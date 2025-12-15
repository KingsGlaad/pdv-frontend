import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3333/:path*", // Redireciona /api/ para o backend NestJS
      },
    ];
  },
};

export default nextConfig;
