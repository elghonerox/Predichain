'use client'

import { useAccount } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button, Card, Badge, EmptyState, SkeletonCard } from '@/components/button'
import { useMarkets } from '@/hooks/useMarkets'
import { formatEther } from 'viem'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function Home() {
  const { address, isConnected } = useAccount()
  const { open } = useWeb3Modal()
<<<<<<< HEAD
  const [mounted, setMounted] = useState(false)

  const { data: markets = [], isLoading: loading } = useMarkets()

=======
  const [markets, setMarkets] = useState<Market[]>([])
  const [loading, setLoading] = useState(true)
  
  // ============================================================================
  // HYDRATION FIX: Use CSS-based hiding instead of conditional rendering
  // ============================================================================
  const [isClient, setIsClient] = useState(false)

>>>>>>> 04673b6f8d687b675c1d55d158a9678dc174f27d
  useEffect(() => {
    setIsClient(true)
  }, [])

<<<<<<< HEAD
  if (!mounted) {
    return null
=======
  useEffect(() => {
    // Only load markets on client side after hydration
    if (!isClient) return
    
    if (isConnected && PREDICTION_MARKET_ADDRESS) {
      loadMarkets()
    } else {
      setLoading(false)
    }
  }, [isClient, isConnected])

  const loadMarkets = async () => {
    try {
      if (!PREDICTION_MARKET_ADDRESS) {
        setLoading(false)
        return
      }

      const marketCount = await readContract(config, {
        address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'getMarketCount',
      })

      const marketArray: Market[] = []
      for (let i = 1; i <= Number(marketCount); i++) {
        try {
          const market = await readContract(config, {
            address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
            abi: PREDICTION_MARKET_ABI,
            functionName: 'getMarket',
            args: [BigInt(i)],
          }) as Market
          
          marketArray.push(market)
        } catch (error) {
          console.log(`Market ${i} not found`)
        }
      }
      
      setMarkets(marketArray)
      setLoading(false)
    } catch (error) {
      console.error('Error loading markets:', error)
      setLoading(false)
    }
>>>>>>> 04673b6f8d687b675c1d55d158a9678dc174f27d
  }

  return (
    <div className="min-h-screen bg-[#0a0d14]">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#6366f1] rounded-full mix-blend-multiply filter blur-[128px] opacity-10"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#06b6d4] rounded-full mix-blend-multiply filter blur-[128px] opacity-10"></div>
      </div>

      <div className="relative z-10">
<<<<<<< HEAD
        {/* Navigation */}
        <nav className="border-b border-[rgba(255,255,255,0.08)] backdrop-blur-xl bg-[#0f1318]/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#6366f1] to-[#06b6d4] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                  <span className="text-white font-bold text-xl">⚡</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">PrediChain</h1>
                  <p className="text-xs text-[#64748b]">BNB Chain</p>
                </div>
              </div>

              <div className="flex gap-3 items-center">
                <ThemeToggle />
=======
        {/* Navigation - Always render with visibility control */}
        <nav className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">⚡</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">PrediChain</h1>
                <p className="text-xs text-purple-300">Powered by BNB Chain</p>
              </div>
            </div>

            <div className="flex gap-3 items-center">
              {/* HYDRATION FIX: Always render, use opacity to hide during SSR */}
              <div 
                style={{ 
                  visibility: isClient ? 'visible' : 'hidden',
                  opacity: isClient ? 1 : 0,
                  transition: 'opacity 0.2s'
                }}
              >
>>>>>>> 04673b6f8d687b675c1d55d158a9678dc174f27d
                {isConnected && (
                  <Link href="/create">
                    <Button variant="secondary" size="md">
                      + Create Market
                    </Button>
                  </Link>
                )}
                {!isConnected ? (
                  <Button onClick={() => open()} variant="primary" size="md">
                    Connect Wallet
                  </Button>
                ) : (
<<<<<<< HEAD
                  <div className="px-4 py-2 bg-[#1a1f29] rounded-lg border border-[rgba(255,255,255,0.08)]">
                    <p className="text-xs text-[#64748b]">Connected</p>
=======
                  <div className="px-4 py-2 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20">
                    <p className="text-xs text-purple-300">Connected</p>
>>>>>>> 04673b6f8d687b675c1d55d158a9678dc174f27d
                    <p className="text-sm text-white font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 bg-[rgba(99,102,241,0.1)] text-[#a5b4fc] rounded-full text-sm font-semibold border border-[rgba(99,102,241,0.3)]">
                🏆 Seedify Prediction Markets Hackathon
              </span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Trade the Future
              <br />
              <span className="bg-gradient-to-r from-[#6366f1] via-[#06b6d4] to-[#10b981] text-transparent bg-clip-text">
                With Confidence
              </span>
            </h2>
            <p className="text-xl text-[#cbd5e1] mb-10 max-w-2xl mx-auto leading-relaxed">
              Fast-resolution prediction markets powered by TWAP oracles. Trade on crypto prices with <span className="font-semibold text-[#06b6d4]">institutional-grade</span> security.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <div className="bg-[#1a1f29] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 hover:border-[rgba(99,102,241,0.3)] transition-all duration-200">
                <div className="text-4xl font-bold bg-gradient-to-r from-[#6366f1] to-[#818cf8] text-transparent bg-clip-text mb-2">⚡ Fast</div>
                <p className="text-[#cbd5e1]">Hours to Resolution</p>
              </div>
              <div className="bg-[#1a1f29] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 hover:border-[rgba(6,182,212,0.3)] transition-all duration-200">
                <div className="text-4xl font-bold bg-gradient-to-r from-[#06b6d4] to-[#10b981] text-transparent bg-clip-text mb-2">🔒 Secure</div>
                <p className="text-[#cbd5e1]">TWAP Oracle Protection</p>
              </div>
              <div className="bg-[#1a1f29] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 hover:border-[rgba(16,185,129,0.3)] transition-all duration-200">
                <div className="text-4xl font-bold bg-gradient-to-r from-[#10b981] to-[#6366f1] text-transparent bg-clip-text mb-2">💎 2%</div>
                <p className="text-[#cbd5e1]">Trading Fees</p>
              </div>
            </div>

<<<<<<< HEAD
            {!isConnected && (
              <Button
                onClick={() => open()}
                variant="primary"
=======
            {/* HYDRATION FIX: Use CSS visibility instead of conditional rendering */}
            <div
              style={{
                visibility: isClient && !isConnected ? 'visible' : 'hidden',
                opacity: isClient && !isConnected ? 1 : 0,
                height: isClient && !isConnected ? 'auto' : 0,
                overflow: 'hidden',
                transition: 'opacity 0.2s, height 0.2s'
              }}
            >
              <Button 
                onClick={() => open()} 
                variant="primary" 
>>>>>>> 04673b6f8d687b675c1d55d158a9678dc174f27d
                size="lg"
                className="transform hover:scale-105 text-lg px-12"
              >
                Get Started →
              </Button>
            </div>
          </div>

<<<<<<< HEAD
          {/* Markets Section */}
          {isConnected && (
=======
          {/* Main Content - Markets */}
          {isClient && isConnected && (
>>>>>>> 04673b6f8d687b675c1d55d158a9678dc174f27d
            <div>
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-bold text-white">Active Markets</h3>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-[#1a1f29] rounded-lg text-white border border-[rgba(255,255,255,0.08)] hover:border-[rgba(99,102,241,0.3)] transition-all">
                    All
                  </button>
                  <button className="px-4 py-2 bg-[rgba(255,255,255,0.02)] rounded-lg text-[#64748b] hover:text-white hover:bg-[rgba(255,255,255,0.04)] transition-all">
                    Active
                  </button>
                  <button className="px-4 py-2 bg-[rgba(255,255,255,0.02)] rounded-lg text-[#64748b] hover:text-white hover:bg-[rgba(255,255,255,0.04)] transition-all">
                    Resolved
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : markets.length === 0 ? (
                <EmptyState
                  icon="📊"
                  title="No Markets Yet"
                  description="Be the first to create a prediction market!"
                  action={
                    <Link href="/create">
                      <Button variant="primary" size="lg">
                        Create First Market
                      </Button>
                    </Link>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {markets.map((market) => {
                    const statusLabels = ['Active', 'Resolved', 'Cancelled']
                    const statusText = statusLabels[market.status] || 'Unknown'
                    const badgeVariant = market.status === 0 ? 'success' : market.status === 1 ? 'info' : 'warning'

                    return (
                      <Card key={market.id.toString()} hover>
                        <div className="mb-4">
                          <div className="flex justify-between items-start mb-3">
                            <Badge variant={badgeVariant}>{statusText}</Badge>
                            <span className="text-[#64748b] text-sm">#{market.id.toString()}</span>
                          </div>
                          <h4 className="text-lg font-bold text-white mb-2 leading-snug">{market.question}</h4>
                          <p className="text-sm text-[#64748b]">
                            Target: <span className="text-[#06b6d4] font-semibold">${parseFloat(formatEther(market.targetPrice)).toLocaleString()}</span> {market.asset}
                          </p>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div>
                            <div className="flex justify-between text-xs text-[#64748b] mb-1">
                              <span>Volume Distribution</span>
                              <span>{parseFloat(formatEther(market.totalVolume)).toFixed(4)} BNB</span>
                            </div>
                            <div className="h-2 bg-[#0f1318] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#10b981] to-[#06b6d4]"
                                style={{ width: `${Number(market.totalVolume) > 0 ? (Number(market.yesVolume) / Number(market.totalVolume)) * 100 : 50}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs mt-1">
                              <span className="text-[#10b981] font-semibold">YES {((Number(market.yesVolume) / Number(market.totalVolume)) * 100 || 50).toFixed(0)}%</span>
                              <span className="text-[#f43f5e] font-semibold">NO {((Number(market.noVolume) / Number(market.totalVolume)) * 100 || 50).toFixed(0)}%</span>
                            </div>
                          </div>
                        </div>

                        <Link href={`/market/${market.id.toString()}`}>
                          <Button variant="outline" size="md" className="w-full">
                            Trade Now →
                          </Button>
                        </Link>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Features Section - Only show when not connected */}
<<<<<<< HEAD
          {!isConnected && (
            <div className="mt-24">
=======
          {isClient && !isConnected && (
            <div className="mt-20">
>>>>>>> 04673b6f8d687b675c1d55d158a9678dc174f27d
              <h3 className="text-3xl font-bold text-white text-center mb-12">Why PrediChain?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-[#1a1f29] border border-[rgba(255,255,255,0.08)] rounded-2xl p-8 hover:border-[rgba(99,102,241,0.3)] transition-all duration-200">
                  <div className="text-4xl mb-4">💡</div>
                  <h4 className="text-xl font-bold text-white mb-3">Transaction Simulation</h4>
                  <p className="text-[#cbd5e1] leading-relaxed">See exactly what will happen before you trade. No surprises, no failed transactions.</p>
                </div>
                <div className="bg-[#1a1f29] border border-[rgba(255,255,255,0.08)] rounded-2xl p-8 hover:border-[rgba(6,182,212,0.3)] transition-all duration-200">
                  <div className="text-4xl mb-4">🛡️</div>
                  <h4 className="text-xl font-bold text-white mb-3">TWAP Protection</h4>
                  <p className="text-[#cbd5e1] leading-relaxed">Time-weighted average pricing prevents flash loan attacks and manipulation.</p>
                </div>
                <div className="bg-[#1a1f29] border border-[rgba(255,255,255,0.08)] rounded-2xl p-8 hover:border-[rgba(16,185,129,0.3)] transition-all duration-200">
                  <div className="text-4xl mb-4">⚡</div>
                  <h4 className="text-xl font-bold text-white mb-3">Instant Clarity</h4>
                  <p className="text-[#cbd5e1] leading-relaxed">Markets resolve in hours, not days. Get your winnings faster than ever.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="border-t border-[rgba(255,255,255,0.08)] mt-24">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center text-[#64748b] text-sm">
              <p>© 2025 PrediChain. Built for Seedify Hackathon on BNB Chain.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
<<<<<<< HEAD
}
=======
}

function MarketCard({ market }: { market: Market }) {
  const statusLabels = ['Active', 'Resolved', 'Cancelled']
  const status = statusLabels[market.status] || 'Unknown'
  
  const badgeVariant = market.status === 0 ? 'success' : market.status === 1 ? 'info' : 'warning'

  return (
    <Card hover className="group">
      <div className="flex justify-between items-start mb-4">
        <Badge variant={badgeVariant}>{status}</Badge>
        <div className="text-2xl">🎯</div>
      </div>

      <h3 className="text-lg font-bold text-white mb-4 line-clamp-2 group-hover:text-yellow-300 transition">
        {market.question}
      </h3>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-purple-300">Asset</span>
          <span className="text-white font-semibold">{market.asset}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-purple-300">Target Price</span>
          <span className="text-white font-semibold">${parseFloat(formatEther(market.targetPrice)).toLocaleString()}</span>
        </div>
        {market.status === 1 && (
          <>
            <div className="flex justify-between items-center text-sm">
              <span className="text-purple-300">Resolution Price</span>
              <span className="text-white font-semibold">${parseFloat(formatEther(market.resolutionPrice)).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-purple-300">Outcome</span>
              <span className={`font-bold ${market.outcome ? 'text-green-400' : 'text-red-400'}`}>
                {market.outcome ? '✓ Yes' : '✗ No'}
              </span>
            </div>
          </>
        )}
        <div className="flex justify-between items-center text-sm pt-2 border-t border-white/10">
          <span className="text-purple-300">Total Volume</span>
          <span className="text-yellow-400 font-bold">{parseFloat(formatEther(market.totalVolume)).toFixed(4)} BNB</span>
        </div>
      </div>

      {market.status === 0 && (
        <Button variant="primary" size="md" className="w-full mt-4">
          Trade Now
        </Button>
      )}
    </Card>
  )
}

function FeatureCard({ icon, title, description, gradient }: { icon: string, title: string, description: string, gradient: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/10 transition">
      <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center text-2xl mb-4`}>
        {icon}
      </div>
      <h4 className="text-lg font-bold text-white mb-2">{title}</h4>
      <p className="text-sm text-purple-300">{description}</p>
    </div>
  )
}
>>>>>>> 04673b6f8d687b675c1d55d158a9678dc174f27d
