import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  
  // Use Turbopack configuration (Next.js 16 default)
  turbopack: {},
  
  // External packages for server components (moved from experimental)
  serverExternalPackages: ['pino', 'pino-pretty', 'thread-stream'],
};

export default nextConfig;
