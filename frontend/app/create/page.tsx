'use client'

import { useAccount } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useState, useEffect } from 'react'
import { readContract } from 'wagmi/actions'
import { config } from '@/lib/wagmi'
import { PREDICTION_MARKET_ABI, PREDICTION_MARKET_ADDRESS } from '@/lib/contracts'
import { formatEther } from 'viem'
import Link from 'next/link'

export default function Home() {
  const { address, isConnected } = useAccount()
  const { open } = useWeb3Modal()
  const [markets, setMarkets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isConnected && PREDICTION_MARKET_ADDRESS) {
      loadMarkets()
    } else {
      setLoading(false)
    }
  }, [isConnected])

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

      const marketArray = []
      for (let i = 1; i <= Number(marketCount); i++) {
        try {
          const market = await readContract(config, {
            address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
            abi: PREDICTION_MARKET_ABI,
            functionName: 'getMarket',
            args: [BigInt(i)],
          })
          marketArray.push({ id: i, ...market })
        } catch (e) {
          // Market doesn't exist
        }
      }
      setMarkets(marketArray)
    } catch (error) {
      console.error('Error loading markets:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10">
        {/* Navigation */}
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
              {mounted && isConnected && (
                <Link
                  href="/create"
                  className="px-6 py-2.5 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-lg hover:from-green-500 hover:to-emerald-600 transition font-semibold shadow-lg"
                >
                  + Create Market
                </Link>
              )}
              {mounted && (
                <>
                  {!isConnected ? (
                    <button
                      onClick={() => open()}
                      className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition font-semibold shadow-lg"
                    >
                      Connect Wallet
                    </button>
                  ) : (
                    <div className="px-4 py-2 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20">
                      <p className="text-xs text-purple-300">Connected</p>
                      <p className="text-sm text-white font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="px-4 py-1.5 bg-yellow-400/20 text-yellow-300 rounded-full text-sm font-semibold border border-yellow-400/30">
                🏆 Seedify Prediction Markets Hackathon
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
              Fast-Resolution
              <br />
              <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 text-transparent bg-clip-text">
                Prediction Markets
              </span>
            </h2>
            <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
              Trade on crypto prices with <span className="font-semibold text-yellow-400">minutes-to-hours resolution</span> and <span className="font-semibold text-pink-400">gasless transactions</span>. Built on BNB Chain.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                <div className="text-3xl font-bold text-yellow-400">⚡ Fast</div>
                <p className="text-sm text-purple-200">Minutes Resolution</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                <div className="text-3xl font-bold text-pink-400">💎 Free</div>
                <p className="text-sm text-purple-200">Gasless Trading</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                <div className="text-3xl font-bold text-purple-400">🔥 2%</div>
                <p className="text-sm text-purple-200">Trading Fees</p>
              </div>
            </div>

            {!mounted ? (
              <div className="text-purple-300">Loading...</div>
            ) : !isConnected && (
              <button
                onClick={() => open()}
                className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-pink-500 text-white rounded-xl hover:from-yellow-500 hover:to-pink-600 transition font-bold text-lg shadow-2xl transform hover:scale-105"
              >
                🚀 Get Started - Connect Wallet
              </button>
            )}
          </div>

          {/* Main Content */}
          {mounted && isConnected && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Active Markets</h3>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-white/10 backdrop-blur-lg rounded-lg text-white hover:bg-white/20 transition border border-white/20">
                    All
                  </button>
                  <button className="px-4 py-2 bg-white/5 backdrop-blur-lg rounded-lg text-purple-300 hover:bg-white/10 transition">
                    Active
                  </button>
                  <button className="px-4 py-2 bg-white/5 backdrop-blur-lg rounded-lg text-purple-300 hover:bg-white/10 transition">
                    Resolved
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-20">
                  <div className="inline-block w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-purple-300 mt-4">Loading markets...</p>
                </div>
              ) : markets.length === 0 ? (
                <div className="text-center py-20 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-2xl font-bold text-white mb-2">No Markets Yet</h3>
                  <p className="text-purple-300 mb-6">Be the first to create a prediction market!</p>
                  <Link
                    href="/create"
                    className="inline-block px-8 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-lg hover:from-green-500 hover:to-emerald-600 transition font-semibold"
                  >
                    Create First Market
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {markets.map((market) => (
                    <MarketCard key={market.id} market={market} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Features Section */}
          {!isConnected && (
            <div className="mt-20">
              <h3 className="text-3xl font-bold text-white text-center mb-12">Why PrediChain?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FeatureCard
                  icon="⚡"
                  title="Fast Resolution"
                  description="Minutes to hours vs 24-48 hours on other platforms"
                  gradient="from-yellow-400 to-orange-500"
                />
                <FeatureCard
                  icon="💎"
                  title="Gasless UX"
                  description="No gas fees for users. Trade without barriers."
                  gradient="from-pink-400 to-purple-500"
                />
                <FeatureCard
                  icon="🔒"
                  title="BNB Chain"
                  description="Low fees ($0.03), fast finality (3s), secure"
                  gradient="from-indigo-400 to-blue-500"
                />
                <FeatureCard
                  icon="📈"
                  title="2% Trading Fees"
                  description="Competitive fees. Transparent revenue model."
                  gradient="from-green-400 to-emerald-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 mt-20 border-t border-white/10">
          <div className="text-center">
            <p className="text-purple-300 mb-2">Built for Seedify Prediction Markets Hackathon</p>
            <div className="flex justify-center gap-4 text-sm text-purple-400">
              <span>Powered by BNB Chain</span>
              <span>•</span>
              <span>Redstone Oracle</span>
              <span>•</span>
              <span>Account Abstraction Ready</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

function MarketCard({ market }: { market: any }) {
  const statusLabels = ['Active', 'Resolved', 'Cancelled']
  const status = statusLabels[market.status] || 'Unknown'

  return (
    <div className="group bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition hover:scale-105 hover:shadow-2xl">
      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          market.status === 0 ? 'bg-green-400/20 text-green-300 border border-green-400/30' :
          market.status === 1 ? 'bg-blue-400/20 text-blue-300 border border-blue-400/30' :
          'bg-gray-400/20 text-gray-300 border border-gray-400/30'
        }`}>
          {status}
        </span>
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
        <button className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition font-semibold">
          Trade Now
        </button>
      )}
    </div>
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