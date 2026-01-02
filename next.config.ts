import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3333/:path*", // Redireciona /api/ para o backend NestJS
      },
      {
        source: "/uploads/:path*",
        destination: "http://localhost:3333/uploads/:path*", // Serve arquivos estáticos do backend
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
};

export default nextConfig;
