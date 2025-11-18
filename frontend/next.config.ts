import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  
  webpack: (config) => {
    // Polyfills for browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    
    // Ignore test files from dependencies
    config.module.rules.push({
      test: /node_modules[\\/]thread-stream[\\/]test[\\/]/,
      loader: 'ignore-loader',
    });
    
    return config;
  },
  
  // External packages for server components
  experimental: {
    serverComponentsExternalPackages: ['pino', 'pino-pretty', 'thread-stream'],
  },
};

export default nextConfig;
