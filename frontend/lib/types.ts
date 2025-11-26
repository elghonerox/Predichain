// frontend/lib/types.ts
import { Address } from 'viem'

export enum MarketStatus {
  Active = 0,
  Resolved = 1,
  Cancelled = 2,
}

export enum TransactionState {
  Idle = 'idle',
  Pending = 'pending',
  Confirming = 'confirming',
  Success = 'success',
  Error = 'error',
}

export interface Market {
  id: bigint
  question: string
  asset: string
  targetPrice: bigint
  resolutionTime: bigint
  creator: Address
  status: MarketStatus
  outcome: boolean
  totalVolume: bigint
  yesVolume: bigint
  noVolume: bigint
  resolutionPrice: bigint
}

export interface Position {
  user: Address
  marketId: bigint
  side: boolean
  amount: bigint
  entryPrice: bigint
  claimed: boolean
}

export interface TransactionStatus {
  state: TransactionState
  hash?: `0x${string}`
  error?: Error
  confirmations?: number
}

export interface CreateMarketFormData {
  question: string
  asset: 'BTC' | 'ETH' | 'BNB'
  targetPrice: string
  resolutionTime: string
}

export interface ValidationError {
  field: string
  message: string
}

export interface FormValidation {
  isValid: boolean
  errors: ValidationError[]
}

export function isMarket(value: unknown): value is Market {
  if (typeof value !== 'object' || value === null) return false
  const m = value as Partial<Market>
  return (
    typeof m.id === 'bigint' &&
    typeof m.question === 'string' &&
    typeof m.asset === 'string' &&
    typeof m.targetPrice === 'bigint' &&
    typeof m.status === 'number'
  )
}

export function isAddress(value: string): value is Address {
  return /^0x[a-fA-F0-9]{40}$/.test(value)
}