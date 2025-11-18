import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer, webpack }) => {
    // Exclude test files and problematic modules from bundling
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    
    // Ignore test files
    config.module.rules.push({
      test: /\.(test|spec|bench)\.(js|ts|mjs)$/,
      use: 'null-loader',
    });
    
    // Ignore thread-stream test and bench directories
    config.module.rules.push({
      test: /node_modules\/thread-stream\/(test|bench)/,
      use: 'null-loader',
    });

    // Add fallbacks for Node.js modules
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
      };
    }

    // Ignore specific problematic modules
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(pino|thread-stream|tap|tape|fastbench|desm|why-is-node-running|pino-elasticsearch)$/,
        contextRegExp: /thread-stream/,
      })
    );

    return config;
  },
};

export default nextConfig;
