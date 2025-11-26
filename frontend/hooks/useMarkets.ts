// hooks/useMarkets.ts - Custom hooks for market operations

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { readContract } from 'wagmi/actions'
import { config } from '@/lib/wagmi'
import { PREDICTION_MARKET_ABI, PREDICTION_MARKET_ADDRESS } from '@/lib/contracts'
import { Market, TransactionStatus, TransactionState } from '@/lib/types'

// ============================================================================
// MARKET LOADING HOOK
// ============================================================================

interface UseMarketsOptions {
  enabled?: boolean
  refetchInterval?: number
  onError?: (error: Error) => void
}

export function useMarkets(options: UseMarketsOptions = {}) {
  const { enabled = true, refetchInterval, onError } = options
  const [markets, setMarkets] = useState<Market[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadMarkets = useCallback(async () => {
    if (!enabled || !PREDICTION_MARKET_ADDRESS) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const marketCount = await readContract(config, {
        address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'getMarketCount',
      })

      const marketPromises = []
      for (let i = 1; i <= Number(marketCount); i++) {
        marketPromises.push(
          readContract(config, {
            address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
            abi: PREDICTION_MARKET_ABI,
            functionName: 'getMarket',
            args: [BigInt(i)],
          }).catch(() => null) // Skip failed markets
        )
      }

      const loadedMarkets = (await Promise.all(marketPromises))
        .filter((m): m is Market => m !== null)

      setMarkets(loadedMarkets)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load markets')
      setError(error)
      onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }, [enabled, onError])

  useEffect(() => {
    loadMarkets()

    if (refetchInterval) {
      const interval = setInterval(loadMarkets, refetchInterval)
      return () => clearInterval(interval)
    }
  }, [loadMarkets, refetchInterval])

  return {
    markets,
    isLoading,
    error,
    refetch: loadMarkets,
  }
}

// ============================================================================
// SINGLE MARKET HOOK
// ============================================================================

export function useMarket(marketId: bigint | number) {
  const { data: market, isLoading, error, refetch } = useReadContract({
    address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'getMarket',
    args: [BigInt(marketId)],
    query: {
      enabled: !!PREDICTION_MARKET_ADDRESS && marketId > 0,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  })

  return {
    market: market as Market | undefined,
    isLoading,
    error,
    refetch,
  }
}

// ============================================================================
// CREATE MARKET HOOK
// ============================================================================

interface CreateMarketParams {
  question: string
  asset: string
  targetPrice: bigint
  resolutionTime: bigint
}

export function useCreateMarket() {
  const [status, setStatus] = useState<TransactionStatus>({
    state: TransactionState.Idle,
  })

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    if (isPending) {
      setStatus({ state: TransactionState.Pending })
    } else if (isConfirming) {
      setStatus({ state: TransactionState.Confirming, hash })
    } else if (isSuccess) {
      setStatus({ state: TransactionState.Success, hash })
    } else if (writeError) {
      setStatus({ state: TransactionState.Error, error: writeError })
    }
  }, [isPending, isConfirming, isSuccess, writeError, hash])

  const createMarket = useCallback(
    async (params: CreateMarketParams) => {
      if (!PREDICTION_MARKET_ADDRESS) {
        throw new Error('Contract address not configured')
      }

      setStatus({ state: TransactionState.Pending })

      try {
        writeContract({
          address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
          abi: PREDICTION_MARKET_ABI,
          functionName: 'createMarket',
          args: [params.question, params.asset, params.targetPrice, params.resolutionTime],
        })
      } catch (error) {
        setStatus({
          state: TransactionState.Error,
          error: error instanceof Error ? error : new Error('Transaction failed'),
        })
      }
    },
    [writeContract]
  )

  const reset = useCallback(() => {
    setStatus({ state: TransactionState.Idle })
  }, [])

  return {
    createMarket,
    status,
    reset,
    isLoading: isPending || isConfirming,
    isSuccess,
  }
}

// ============================================================================
// BUY POSITION HOOK
// ============================================================================

interface BuyPositionParams {
  marketId: bigint
  side: boolean
  amount: bigint
}

export function useBuyPosition() {
  const [status, setStatus] = useState<TransactionStatus>({
    state: TransactionState.Idle,
  })

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    if (isPending) {
      setStatus({ state: TransactionState.Pending })
    } else if (isConfirming) {
      setStatus({ state: TransactionState.Confirming, hash })
    } else if (isSuccess) {
      setStatus({ state: TransactionState.Success, hash })
    } else if (writeError) {
      setStatus({ state: TransactionState.Error, error: writeError })
    }
  }, [isPending, isConfirming, isSuccess, writeError, hash])

  const buyPosition = useCallback(
    async (params: BuyPositionParams) => {
      if (!PREDICTION_MARKET_ADDRESS) {
        throw new Error('Contract address not configured')
      }

      setStatus({ state: TransactionState.Pending })

      try {
        writeContract({
          address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
          abi: PREDICTION_MARKET_ABI,
          functionName: 'buyPosition',
          args: [params.marketId, params.side],
          value: params.amount,
        })
      } catch (error) {
        setStatus({
          state: TransactionState.Error,
          error: error instanceof Error ? error : new Error('Transaction failed'),
        })
      }
    },
    [writeContract]
  )

  const reset = useCallback(() => {
    setStatus({ state: TransactionState.Idle })
  }, [])

  return {
    buyPosition,
    status,
    reset,
    isLoading: isPending || isConfirming,
    isSuccess,
  }
}

// ============================================================================
// USER POSITION HOOK
// ============================================================================

export function useUserPosition(marketId: bigint | number) {
  const { address } = useAccount()

  const { data: position, isLoading, error, refetch } = useReadContract({
    address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'getPosition',
    args: [BigInt(marketId), address!],
    query: {
      enabled: !!PREDICTION_MARKET_ADDRESS && !!address && marketId > 0,
      refetchInterval: 10000,
    },
  })

  return {
    position,
    isLoading,
    error,
    refetch,
  }
}

// ============================================================================
// FILTERED MARKETS HOOK
// ============================================================================

export function useFilteredMarkets(filterFn?: (market: Market) => boolean) {
  const { markets, isLoading, error, refetch } = useMarkets()

  const filteredMarkets = useMemo(() => {
    if (!filterFn) return markets
    return markets.filter(filterFn)
  }, [markets, filterFn])

  return {
    markets: filteredMarkets,
    isLoading,
    error,
    refetch,
  }
}

// ============================================================================
// MARKET STATISTICS HOOK
// ============================================================================

export function useMarketStats() {
  const { markets, isLoading } = useMarkets()

  const stats = useMemo(() => {
    const totalVolume = markets.reduce((sum, m) => sum + m.totalVolume, BigInt(0))
    const activeMarkets = markets.filter(m => m.status === 0).length
    const resolvedMarkets = markets.filter(m => m.status === 1).length

    return {
      totalMarkets: markets.length,
      activeMarkets,
      resolvedMarkets,
      totalVolume,
    }
  }, [markets])

  return {
    stats,
    isLoading,
  }
}