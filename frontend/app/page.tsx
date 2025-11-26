'use client'

import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useState, useEffect } from 'react'
import { PREDICTION_MARKET_ABI, PREDICTION_MARKET_ADDRESS } from '@/lib/contracts'
import { parseEther } from 'viem'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreateMarket() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const [question, setQuestion] = useState('')
  const [asset, setAsset] = useState('BTC')
  const [targetPrice, setTargetPrice] = useState('')
  const [resolutionTime, setResolutionTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Fix hydration error by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected || !PREDICTION_MARKET_ADDRESS) return

    setLoading(true)
    try {
      const targetPriceWei = parseEther(targetPrice)
      const resolutionTimestamp = Math.floor(new Date(resolutionTime).getTime() / 1000)

      writeContract({
        address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'createMarket',
        args: [question, asset, targetPriceWei, BigInt(resolutionTimestamp)],
      })
    } catch (error) {
      console.error('Error creating market:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isSuccess) {
      const timeout = setTimeout(() => router.push('/'), 2000)
      return () => clearTimeout(timeout)
    }
  }, [isSuccess, router])

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        </div>
        <div className="relative z-10 text-center bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-purple-300 mb-6">You need to connect your wallet to create a market.</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition font-semibold"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">⚡</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">PrediChain</h1>
                <p className="text-xs text-purple-300">Powered by BNB Chain</p>
              </div>
            </Link>

            <div className="px-4 py-2 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20">
              <p className="text-xs text-purple-300">Connected</p>
              <p className="text-sm text-white font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <Link
                href="/"
                className="inline-flex items-center text-purple-300 hover:text-white mb-6 transition"
              >
                <span className="mr-2">←</span> Back to Markets
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Create Prediction Market
              </h1>
              <p className="text-lg text-purple-300">
                Set up a new crypto price prediction market
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 space-y-6">
              {/* Question */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Market Question
                  <span className="text-pink-400 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g., Will BTC price exceed $100,000 by Dec 31, 2025?"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-purple-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  required
                />
                <p className="text-xs text-purple-400 mt-1">Make it clear and specific</p>
              </div>

              {/* Asset Selection */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Asset
                  <span className="text-pink-400 ml-1">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['BTC', 'ETH', 'BNB'].map((crypto) => (
                    <button
                      key={crypto}
                      type="button"
                      onClick={() => setAsset(crypto)}
                      className={`px-4 py-3 rounded-lg font-semibold transition ${
                        asset === crypto
                          ? 'bg-gradient-to-r from-yellow-400 to-pink-500 text-white'
                          : 'bg-white/5 border border-white/20 text-purple-300 hover:bg-white/10'
                      }`}
                    >
                      {crypto}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Price */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Target Price (USD)
                  <span className="text-pink-400 ml-1">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-purple-400 text-lg">$</span>
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder="100000"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-purple-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    required
                  />
                </div>
                <p className="text-xs text-purple-400 mt-1">The price point you&apos;re predicting</p>
              </div>

              {/* Resolution Time */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Resolution Time
                  <span className="text-pink-400 ml-1">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={resolutionTime}
                  onChange={(e) => setResolutionTime(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  required
                />
                <p className="text-xs text-purple-400 mt-1">When should this market resolve?</p>
              </div>

              {/* Info Box */}
              <div className="bg-indigo-500/20 border border-indigo-400/30 rounded-lg p-4">
                <div className="flex items-start">
                  <span className="text-2xl mr-3">💡</span>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Market Creation</h4>
                    <p className="text-sm text-purple-300">
                      Creating a market is free. You&apos;ll earn 20% of trading fees from your market.
                      Markets resolve automatically using Redstone oracle.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending || isConfirming || loading}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-lg hover:from-green-500 hover:to-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-lg disabled:hover:from-green-400 disabled:hover:to-emerald-500"
              >
                {isPending || isConfirming || loading ? (
                  <span className="flex items-center justify-center">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    Creating Market...
                  </span>
                ) : (
                  '🚀 Create Market'
                )}
              </button>

              {/* Success Message */}
              {isSuccess && (
                <div className="p-4 bg-green-500/20 border border-green-400/30 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">✅</span>
                    <div>
                      <p className="text-green-300 font-semibold">Market created successfully!</p>
                      <p className="text-sm text-green-400 mt-1 font-mono">
                        Tx: {hash?.slice(0, 10)}...{hash?.slice(-8)}
                      </p>
                      <p className="text-xs text-green-400 mt-1">Redirecting to markets...</p>
                    </div>
                  </div>
                </div>
              )}
            </form>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-white/5 backdrop-blur-lg rounded-lg p-4 border border-white/10">
                <div className="text-2xl mb-2">⚡</div>
                <h4 className="text-white font-semibold mb-1">Fast Resolution</h4>
                <p className="text-xs text-purple-300">Resolves in minutes using Redstone oracle</p>
              </div>
              <div className="bg-white/5 backdrop-blur-lg rounded-lg p-4 border border-white/10">
                <div className="text-2xl mb-2">💰</div>
                <h4 className="text-white font-semibold mb-1">Earn Fees</h4>
                <p className="text-xs text-purple-300">Get 20% of all trading fees from your market</p>
              </div>
              <div className="bg-white/5 backdrop-blur-lg rounded-lg p-4 border border-white/10">
                <div className="text-2xl mb-2">🔒</div>
                <h4 className="text-white font-semibold mb-1">Secure</h4>
                <p className="text-xs text-purple-300">Built on BNB Chain with verified contracts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}