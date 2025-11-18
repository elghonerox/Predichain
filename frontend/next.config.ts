import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Add empty turbopack config to silence the error
  turbopack: {},
  
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
