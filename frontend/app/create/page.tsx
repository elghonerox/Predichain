'use client'

import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useState, useEffect } from 'react'
import { PREDICTION_MARKET_ABI, PREDICTION_MARKET_ADDRESS } from '@/lib/contracts'
import { parseEther } from 'viem'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, Input, Card, Alert } from '@/components/button'

export default function CreateMarket() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const [question, setQuestion] = useState('')
  const [asset, setAsset] = useState('BTC')
  const [targetPrice, setTargetPrice] = useState('')
  const [resolutionTime, setResolutionTime] = useState('')
  const [mounted, setMounted] = useState(false)

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
    }
  }

  useEffect(() => {
    if (isSuccess) {
      const timeout = setTimeout(() => router.push('/'), 2000)
      return () => clearTimeout(timeout)
    }
  }, [isSuccess, router])

  if (!mounted) {
    return null
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        </div>
        <div className="relative z-10 text-center max-w-md">
          <Card>
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
            <p className="text-purple-300 mb-6">You need to connect your wallet to create a market.</p>
            <Link href="/">
              <Button variant="primary" size="lg" className="w-full">
                Go Back Home
              </Button>
            </Link>
          </Card>
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
              <Link href="/" className="inline-flex items-center text-purple-300 hover:text-white mb-6 transition">
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <div className="space-y-6">
                  {/* Question */}
                  <Input
                    label="Market Question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g., Will BTC price exceed $100,000 by Dec 31, 2025?"
                    required
                    helperText="Make it clear and specific"
                  />

                  {/* Asset Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Asset <span className="text-pink-400">*</span>
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
                      Target Price (USD) <span className="text-pink-400">*</span>
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
                  <Input
                    label="Resolution Time"
                    type="datetime-local"
                    value={resolutionTime}
                    onChange={(e) => setResolutionTime(e.target.value)}
                    required
                    helperText="When should this market resolve?"
                  />

                  {/* Info Box */}
                  <Alert
                    type="info"
                    title="Market Creation"
                    message="Creating a market is free. You'll earn 20% of trading fees from your market. Markets resolve automatically using Redstone oracle."
                  />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="secondary"
                    size="lg"
                    isLoading={isPending || isConfirming}
                    disabled={isPending || isConfirming}
                    className="w-full"
                  >
                    {isPending || isConfirming ? 'Creating Market...' : '🚀 Create Market'}
                  </Button>

                  {/* Success Message */}
                  {isSuccess && (
                    <Alert
                      type="success"
                      title="Market created successfully!"
                      message={`Transaction: ${hash?.slice(0, 10)}...${hash?.slice(-8)} - Redirecting to markets...`}
                    />
                  )}
                </div>
              </Card>
            </form>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <Card>
                <div className="text-2xl mb-2">⚡</div>
                <h4 className="text-white font-semibold mb-1">Fast Resolution</h4>
                <p className="text-xs text-purple-300">Resolves in minutes using Redstone oracle</p>
              </Card>
              <Card>
                <div className="text-2xl mb-2">💰</div>
                <h4 className="text-white font-semibold mb-1">Earn Fees</h4>
                <p className="text-xs text-purple-300">Get 20% of all trading fees from your market</p>
              </Card>
              <Card>
                <div className="text-2xl mb-2">🔒</div>
                <h4 className="text-white font-semibold mb-1">Secure</h4>
                <p className="text-xs text-purple-300">Built on BNB Chain with verified contracts</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}