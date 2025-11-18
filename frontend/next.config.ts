import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicitly disable turbopack for production builds
  experimental: {
    turbo: {
      rules: {
        '*.test.{js,jsx,ts,tsx,mjs}': {
          loaders: [],
          as: '*.js',
        },
        '*.spec.{js,jsx,ts,tsx,mjs}': {
          loaders: [],
          as: '*.js',
        },
      },
      resolveAlias: {
        'thread-stream/test': false,
        'thread-stream/bench': false,
      },
    },
  },

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

    // Ignore specific file types that cause issues
    config.module.rules.push({
      test: /\.(md|sh|zip|LICENSE)$/,
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
        child_process: false,
        worker_threads: false,
      };
    }

    // Ignore specific problematic modules
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(pino|tap|tape|fastbench|desm|why-is-node-running|pino-elasticsearch)$/,
      })
    );

    // Additional ignore for thread-stream internals
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /thread-stream\/(test|bench)/,
      })
    );

    return config;
  },

  // Explicitly ignore these paths during build
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  // Optimize for production
  swcMinify: true,
  
  // Output standalone for better Vercel deployment
  output: 'standalone',
};

export default nextConfig;
