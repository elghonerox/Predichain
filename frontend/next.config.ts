import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force webpack mode (disable Turbopack)
  turbopack: false as any,
  
  webpack: (config, { isServer }) => {
    // Exclude test files and problematic modules
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    
    config.module.rules.push({
      test: /node_modules\/thread-stream\/(test|bench)/,
      use: 'null-loader',
    });

    // External modules that shouldn't be bundled
    if (!isServer) {
      config.externals = config.externals || [];
      config.externals.push('pino', 'thread-stream');
    }

    return config;
  },
};

export default nextConfig;
