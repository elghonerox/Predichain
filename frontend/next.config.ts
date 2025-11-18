import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  
  // Exclude problematic test files and dependencies
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Exclude test files from being bundled
    config.module.rules.push({
      test: /node_modules\/thread-stream\/test\//,
      use: 'ignore-loader',
    });
    
    return config;
  },
  
  // Exclude test files from being processed
  transpilePackages: ['@web3modal/wagmi', '@walletconnect'],
  
  // Ignore specific patterns during build
  experimental: {
    serverComponentsExternalPackages: ['pino', 'thread-stream'],
  },
};

export default nextConfig;
