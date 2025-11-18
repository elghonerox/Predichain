import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove all turbopack configuration entirely
  // Use standard webpack instead
  
  webpack: (config, { isServer, webpack }) => {
    // Ignore problematic modules and test files
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/test$/,
        contextRegExp: /thread-stream$/
      })
    );

    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(pino|tap|tape|fastbench|desm|why-is-node-running|pino-elasticsearch)$/,
      })
    );

    // Handle specific file extensions that cause issues
    config.module.rules.push({
      test: /node_modules[\\/]thread-stream[\\/].*\.(test|spec|bench)\.(js|ts|mjs)$/,
      use: 'ignore-loader'
    });

    config.module.rules.push({
      test: /\.(md|sh|zip|yml)$/,
      use: 'ignore-loader'
    });

    // Node.js module fallbacks for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        zlib: require.resolve('browserify-zlib'),
        path: require.resolve('path-browserify'),
        os: require.resolve('os-browserify/browser'),
      };
    }

    return config;
  },

  // Remove turbopack-related configurations
  swcMinify: true,
  output: 'standalone',
  
  // Add compiler optimization
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
