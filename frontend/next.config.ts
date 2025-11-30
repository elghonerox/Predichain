/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@web3modal/wagmi'],
    webpack: (config) => {
        config.resolve.fallback = { fs: false, net: false, tls: false }
        config.externals.push('pino-pretty', 'lokijs', 'encoding')

        // Ignore test files in dependencies
        config.module.rules.push({
            test: /\.(test|spec)\.(js|ts|jsx|tsx)$/,
            loader: 'ignore-loader'
        })

        return config
    },
}

export default nextConfig
