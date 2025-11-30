// ============================================================================
// frontend/lib/config.ts - Centralized Configuration Management
// ============================================================================

/**
 * Enterprise-grade configuration management with:
 * - Type safety
 * - Runtime validation
 * - Environment-specific defaults
 * - Error handling
 */

export enum Environment {
  Development = 'development',
  Test = 'test',
  Staging = 'staging',
  Production = 'production',
}

export enum ChainId {
  HardhatLocal = 31337,
  BSCTestnet = 97,
  BSCMainnet = 56,
}

interface NetworkConfig {
  chainId: ChainId
  rpcUrl: string
  blockExplorer: string
  name: string
}

interface ContractAddresses {
  predictionMarket: string
  oracleAdapter: string
  treasury: string
}

interface AppConfig {
  environment: Environment
  network: NetworkConfig
  contracts: ContractAddresses
  walletConnect: {
    projectId: string
  }
  features: {
    enableGaslessTransactions: boolean
    enableAnalytics: boolean
  }
  api: {
    baseUrl: string
    timeout: number
  }
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

function validateAddress(address: string, fieldName: string): string {
  if (!address || address === '') {
    throw new Error(`${fieldName} is required but not configured`)
  }

  if (!address.startsWith('0x') || address.length !== 42) {
    throw new Error(`${fieldName} is not a valid Ethereum address: ${address}`)
  }

  return address
}

function validateUrl(url: string, fieldName: string): string {
  if (!url || url === '') {
    throw new Error(`${fieldName} is required but not configured`)
  }

  try {
    new URL(url)
    return url
  } catch (error) {
    throw new Error(`${fieldName} is not a valid URL: ${url}`)
  }
}

function validateProjectId(projectId: string): string {
  if (!projectId || projectId === '') {
    console.warn('⚠️  WalletConnect Project ID not configured. Wallet connection may not work.')
    return '0893b6579e0a17ca509b1e6e231e8240' // Fallback
  }

  if (projectId.length < 32) {
    console.warn('⚠️  WalletConnect Project ID looks invalid (too short)')
  }

  return projectId
}

// ============================================================================
// ENVIRONMENT DETECTION
// ============================================================================

function detectEnvironment(): Environment {
  const nodeEnv = process.env.NODE_ENV
  const customEnv = process.env.NEXT_PUBLIC_APP_ENV

  if (customEnv) {
    return customEnv as Environment
  }

  switch (nodeEnv) {
    case 'production':
      return Environment.Production
    case 'test':
      return Environment.Test
    default:
      return Environment.Development
  }
}

// ============================================================================
// NETWORK CONFIGURATION
// ============================================================================

function getNetworkConfig(chainId: number): NetworkConfig {
  switch (chainId) {
    case ChainId.HardhatLocal:
      return {
        chainId: ChainId.HardhatLocal,
        rpcUrl: 'http://127.0.0.1:8545',
        blockExplorer: 'http://localhost:8545',
        name: 'Hardhat Local',
      }

    case ChainId.BSCTestnet:
      return {
        chainId: ChainId.BSCTestnet,
        rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
        blockExplorer: 'https://testnet.bscscan.com',
        name: 'BNB Chain Testnet',
      }

    case ChainId.BSCMainnet:
      return {
        chainId: ChainId.BSCMainnet,
        rpcUrl: 'https://bsc-dataseed.binance.org/',
        blockExplorer: 'https://bscscan.com',
        name: 'BNB Chain Mainnet',
      }

    default:
      throw new Error(`Unsupported chain ID: ${chainId}`)
  }
}

// ============================================================================
// CONTRACT ADDRESSES (Environment-Specific)
// ============================================================================

function getContractAddresses(env: Environment, chainId: ChainId): ContractAddresses {
  // CI/CD Environment (GitHub Actions)
  if (process.env.CI === 'true') {
    console.log('🤖 CI/CD Environment detected - using mock addresses')
    return {
      predictionMarket: '0x0000000000000000000000000000000000000001',
      oracleAdapter: '0x0000000000000000000000000000000000000002',
      treasury: '0x0000000000000000000000000000000000000003',
    }
  }

  // Test Environment
  if (env === Environment.Test) {
    return {
      predictionMarket: '0x0000000000000000000000000000000000000001',
      oracleAdapter: '0x0000000000000000000000000000000000000002',
      treasury: '0x0000000000000000000000000000000000000003',
    }
  }

  // Development Environment (Local Hardhat)
  if (env === Environment.Development && chainId === ChainId.HardhatLocal) {
    // Try to load from deployment file
    try {
      const deploymentFile = require('../../../deployments/localhost-latest.json')
      return {
        predictionMarket: deploymentFile.contracts.PredictionMarket.address,
        oracleAdapter: deploymentFile.contracts.OracleAdapter.address,
        treasury: deploymentFile.contracts.Treasury.address,
      }
    } catch (error) {
      console.warn('⚠️  Could not load deployment file, using environment variables')
    }
  }

  // From Environment Variables (Production/Staging)
  const envAddresses = {
    predictionMarket: process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS || '',
    oracleAdapter: process.env.NEXT_PUBLIC_ORACLE_ADAPTER_ADDRESS || '',
    treasury: process.env.NEXT_PUBLIC_TREASURY_ADDRESS || '',
  }

  // Validate addresses in non-test environments
  if (!process.env.CI) {
    try {
      envAddresses.predictionMarket = validateAddress(
        envAddresses.predictionMarket,
        'NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS'
      )
    } catch (error) {
      console.error('❌ Contract address validation failed:', error)
      throw error
    }
  }

  return envAddresses as ContractAddresses
}

// ============================================================================
// MAIN CONFIGURATION BUILDER
// ============================================================================

function buildConfig(): AppConfig {
  const environment = detectEnvironment()

  const chainId = parseInt(
    process.env.NEXT_PUBLIC_CHAIN_ID || String(ChainId.HardhatLocal)
  )

  const network = getNetworkConfig(chainId)
  const contracts = getContractAddresses(environment, chainId)

  const config: AppConfig = {
    environment,
    network,
    contracts,
    walletConnect: {
      projectId: validateProjectId(
        process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || ''
      ),
    },
    features: {
      enableGaslessTransactions: environment === Environment.Production,
      enableAnalytics: environment === Environment.Production,
    },
    api: {
      baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
      timeout: 30000,
    },
  }

  // Log configuration in development
  if (environment === Environment.Development) {
    console.log('📋 Application Configuration:', {
      environment,
      chainId,
      network: network.name,
      contracts: {
        predictionMarket: contracts.predictionMarket.slice(0, 10) + '...',
        oracleAdapter: contracts.oracleAdapter.slice(0, 10) + '...',
        treasury: contracts.treasury.slice(0, 10) + '...',
      },
    })
  }

  return config
}

// ============================================================================
// SINGLETON PATTERN
// ============================================================================

let cachedConfig: AppConfig | null = null

export function getConfig(): AppConfig {
  if (!cachedConfig) {
    cachedConfig = buildConfig()
  }
  return cachedConfig
}

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

export function getContractAddress(contract: keyof ContractAddresses): string {
  return getConfig().contracts[contract]
}

export function getNetworkInfo() {
  return getConfig().network
}

export function isProduction(): boolean {
  return getConfig().environment === Environment.Production
}

export function isDevelopment(): boolean {
  return getConfig().environment === Environment.Development
}

export function isTest(): boolean {
  return getConfig().environment === Environment.Test
}

export function isCIEnvironment(): boolean {
  return process.env.CI === 'true'
}

// ============================================================================
// REACT HOOK
// ============================================================================

import { useMemo } from 'react'

export function useConfig() {
  return useMemo(() => getConfig(), [])
}

// ============================================================================
// ERROR BOUNDARY INTEGRATION
// ============================================================================

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConfigurationError'
  }
}

// ============================================================================
// VALIDATION EXPORT
// ============================================================================

export function validateConfiguration(): boolean {
  try {
    const config = getConfig()

    // Check critical fields
    if (!config.contracts.predictionMarket) {
      throw new ConfigurationError('PredictionMarket address not configured')
    }

    if (!config.network.rpcUrl) {
      throw new ConfigurationError('RPC URL not configured')
    }

    console.log('✅ Configuration validation passed')
    return true
  } catch (error) {
    console.error('❌ Configuration validation failed:', error)
    return false
  }
}

// ============================================================================
// UPDATE CONTRACTS.TS TO USE NEW CONFIG
// ============================================================================

// frontend/lib/contracts.ts
import { getContractAddress } from './config'

export const PREDICTION_MARKET_ABI = [
  // ... existing ABI
] as const

// Use centralized config instead of direct env access
export const PREDICTION_MARKET_ADDRESS = getContractAddress('predictionMarket')
export const ORACLE_ADAPTER_ADDRESS = getContractAddress('oracleAdapter')
export const TREASURY_ADDRESS = getContractAddress('treasury')

// ============================================================================
// UPDATE WAGMI.TS TO USE NEW CONFIG
// ============================================================================

// frontend/lib/wagmi.ts
import { defaultWagmiConfig } from '@web3modal/wagmi'
import { bsc, bscTestnet } from 'wagmi/chains'
import { getConfig } from './config'

const config = getConfig()

export const projectId = config.walletConnect.projectId

const metadata = {
  name: 'PrediChain',
  description: 'Fast-Resolution Prediction Markets with Gasless UX on BNB Chain',
  url: 'https://predichain.xyz',
  icons: ['https://predichain.xyz/logo.png']
}

export const wagmiConfig = defaultWagmiConfig({
  chains: [bscTestnet, bsc],
  projectId,
  metadata,
})
