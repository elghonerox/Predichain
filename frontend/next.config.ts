import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  serverExternalPackages: ['pino', 'thread-stream'],
};

export default nextConfig;
