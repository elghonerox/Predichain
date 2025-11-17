import { defaultWagmiConfig } from '@web3modal/wagmi'
import { bsc, bscTestnet } from 'wagmi/chains'

// Get projectId from https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '0893b6579e0a17ca509b1e6e231e8240'

const metadata = {
  name: 'PrediChain',
  description: 'Fast-Resolution Prediction Markets with Gasless UX on BNB Chain',
  url: 'https://predichain.xyz',
  icons: ['https://predichain.xyz/logo.png']
}

export const config = defaultWagmiConfig({
  chains: [bscTestnet, bsc], // BNB Chain testnet and mainnet
  projectId,
  metadata,
})

// BNB Chain configuration
export const bscTestnetConfig = {
  id: 97,
  name: 'BNB Smart Chain Testnet',
  network: 'bsc-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'BNB',
    symbol: 'BNB',
  },
  rpcUrls: {
    default: {
      http: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
    },
    public: {
      http: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
    },
  },
  blockExplorers: {
    default: { name: 'BscScan', url: 'https://testnet.bscscan.com' },
  },
  testnet: true,
}