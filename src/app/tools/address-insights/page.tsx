'use client'

import { useEffect, useState } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import { Loader2, CheckCircle2, Search, TrendingUp, Wallet as WalletIcon, RefreshCw, ExternalLink, AlertCircle, Lock } from 'lucide-react'
import AvaxCheckout from '@/components/AvaxCheckout'
import { merchantAddress } from '@/lib/contract'
import { Navbar } from '@/components/ui'
import { formatEther, isAddress, type Address } from 'viem'

interface TokenBalance {
  name: string
  symbol: string
  balance: string
  contractAddress: string
}

interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  timestamp: number
  blockNumber: number
}

interface AddressInsights {
  balance: string
  tokenCount: number
  totalTransactions: number
  totalSent: string
  totalReceived: string
  firstSeen: number
  tokens: TokenBalance[]
  recentTx: Transaction[]
}

export default function AddressInsightsPage() {
  const { address: connectedAddress, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null)
  const [showCheckout, setShowCheckout] = useState(false)

  // Analysis state
  const [targetAddress, setTargetAddress] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [insights, setInsights] = useState<AddressInsights | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<string>('')

  useEffect(() => {
    if (isConnected && connectedAddress) {
      checkAccess()
    } else {
      setLoading(false)
    }
  }, [connectedAddress, isConnected])

  const checkAccess = async () => {
    if (!connectedAddress) return

    try {
      setLoading(true)
      const response = await fetch('/api/access/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: connectedAddress,
          merchant: merchantAddress,
        }),
      })

      const data = await response.json()
      setHasAccess(data.access)

      if (data.access && data.subscription) {
        setSubscriptionInfo(data.subscription)
      }
    } catch (error) {
      console.error('Error checking access:', error)
      setHasAccess(false)
    } finally {
      setLoading(false)
    }
  }

  const analyzeAddress = async () => {
    if (!targetAddress || !isAddress(targetAddress)) {
      setError('Please enter a valid EVM address')
      return
    }

    if (!publicClient) {
      setError('Network client not available')
      return
    }

    setAnalyzing(true)
    setError(null)
    setInsights(null)
    setProgress('Fetching wallet data...')

    try {
      const [balance, txCount] = await Promise.all([
        publicClient.getBalance({ address: targetAddress as Address }),
        publicClient.getTransactionCount({ address: targetAddress as Address }),
      ])

      setProgress('Processing data...')

      setInsights({
        balance: formatEther(balance),
        tokenCount: 0,
        totalTransactions: txCount,
        totalSent: '0',
        totalReceived: '0',
        firstSeen: Date.now() / 1000,
        tokens: [],
        recentTx: [],
      })
    } catch (err: any) {
      console.error('Analysis error:', err)
      setError(err.message || 'Failed to analyze address')
    } finally {
      setAnalyzing(false)
      setProgress('')
    }
  }

  // Wallet not connected
  if (!isConnected) {
    return (
      <div className="bg-[#0A0A0C] min-h-screen text-white font-sans">
        <Navbar />
        <main className="min-h-screen flex items-center justify-center px-4 pt-32 pb-16">
          <div className="max-w-2xl w-full text-center">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C3FF32]/5 blur-[120px] rounded-full"></div>
            </div>

            <div className="relative z-10">
              <div className="w-20 h-20 bg-[#C3FF32]/10 border border-[#C3FF32]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Lock size={40} className="text-[#C3FF32]" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                Address Insights
              </h1>
              <p className="text-gray-400 text-lg mb-12 max-w-xl mx-auto">
                Premium tool for deep wallet analysis. Connect your wallet to access.
              </p>

              <div className="bg-[#0E0E11] rounded-2xl border border-white/5 p-8 relative overflow-hidden group hover:border-[#C3FF32]/30 transition-all">
                <div className="absolute -inset-4 bg-[#C3FF32]/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <button
                    onClick={() => window.location.href = '/checkout-demo'}
                    className="px-10 py-4 bg-[#C3FF32] text-black rounded-xl font-bold text-base tracking-tight hover:bg-[#b0e62e] transition-all duration-200 shadow-[0_0_30px_rgba(195,255,50,0.4)] hover:shadow-[0_0_40px_rgba(195,255,50,0.5)] active:scale-[0.98] flex items-center justify-center gap-2 mx-auto"
                  >
                    <WalletIcon size={20} />
                    Connect Wallet
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="bg-[#0A0A0C] min-h-screen text-white font-sans">
        <Navbar />
        <main className="min-h-screen flex items-center justify-center px-4 pt-32">
          <div className="text-center">
            <div className="relative">
              <Loader2 className="animate-spin h-12 w-12 text-[#C3FF32] mx-auto mb-4" />
              <div className="absolute inset-0 bg-[#C3FF32]/20 blur-xl rounded-full"></div>
            </div>
            <p className="text-gray-400 text-lg">Verifying subscription...</p>
          </div>
        </main>
      </div>
    )
  }

  // No access - locked state
  if (hasAccess === false) {
    return (
      <div className="bg-[#0A0A0C] min-h-screen text-white font-sans">
        <Navbar />
        <main className="min-h-screen flex items-center justify-center px-4 pt-32 pb-16">
          <div className="max-w-2xl w-full text-center">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C3FF32]/5 blur-[120px] rounded-full"></div>
            </div>

            <div className="relative z-10">
              <div className="w-20 h-20 bg-[#C3FF32]/10 border border-[#C3FF32]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Lock size={40} className="text-[#C3FF32]" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                Premium Tool Locked
              </h1>
              <p className="text-gray-400 text-lg mb-2 max-w-xl mx-auto">
                Address Insights requires an active subscription.
              </p>
              <p className="text-sm text-gray-500 mb-12 font-mono">
                {connectedAddress?.slice(0, 6)}...{connectedAddress?.slice(-4)}
              </p>

              <div className="bg-[#0E0E11] rounded-2xl border border-white/5 p-8 relative overflow-hidden group hover:border-[#C3FF32]/30 transition-all">
                <div className="absolute -inset-4 bg-[#C3FF32]/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  {showCheckout ? (
                    <AvaxCheckout 
                      onSuccess={() => {
                        setShowCheckout(false)
                        checkAccess()
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="text-center mb-2">
                        <p className="text-sm text-gray-400 mb-1">Premium Subscription</p>
                        <p className="text-2xl font-bold text-white">
                          0.001 <span className="text-[#C3FF32]">AVAX</span>
                        </p>
                      </div>
                      <button
                        onClick={() => setShowCheckout(true)}
                        className="relative px-10 py-4 bg-[#C3FF32] text-black rounded-xl font-bold text-base tracking-tight hover:bg-[#b0e62e] transition-all duration-200 shadow-[0_0_30px_rgba(195,255,50,0.4)] hover:shadow-[0_0_40px_rgba(195,255,50,0.5)] active:scale-[0.98]"
                      >
                        <span className="relative z-10">Subscribe Now</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-xl opacity-0 hover:opacity-100 transition-opacity"></div>
                      </button>
                      <p className="text-xs text-gray-500 mt-1">One-time payment • Instant access</p>
                    </div>
                  )}

                  <button
                    onClick={checkAccess}
                    className="mt-6 text-sm text-gray-400 hover:text-[#C3FF32] transition-colors flex items-center justify-center gap-2 mx-auto"
                  >
                    <RefreshCw size={14} />
                    Already subscribed? Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Has access - show the tool
  return (
    <div className="bg-[#0A0A0C] min-h-screen text-white font-sans">
      <Navbar />
      <main className="min-h-screen pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#C3FF32]/10 border border-[#C3FF32]/20 rounded-xl flex items-center justify-center">
                <Search size={24} className="text-[#C3FF32]" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  Address Insights
                </h1>
                <p className="text-gray-400 text-sm">
                  Deep wallet analysis for Avalanche addresses
                </p>
              </div>
            </div>
            
            {subscriptionInfo && (
              <div className="inline-flex items-center gap-2 bg-[#C3FF32]/10 border border-[#C3FF32]/20 px-4 py-2 rounded-lg">
                <CheckCircle2 size={16} className="text-[#C3FF32]" />
                <span className="text-[#C3FF32] font-bold text-sm">Premium Active</span>
              </div>
            )}
          </div>

          {/* Input Section */}
          <div className="bg-[#0E0E11] rounded-2xl border border-white/5 p-8 mb-8 relative overflow-hidden group hover:border-[#C3FF32]/30 transition-all">
            <div className="absolute -inset-4 bg-[#C3FF32]/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <label className="block text-sm font-semibold text-gray-400 mb-3">
                Enter Wallet Address
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={targetAddress}
                  onChange={(e) => setTargetAddress(e.target.value)}
                  placeholder="0x..."
                  className="flex-1 bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#C3FF32]/50 focus:ring-2 focus:ring-[#C3FF32]/20 transition-all font-mono text-sm"
                />
                <button
                  onClick={analyzeAddress}
                  disabled={analyzing || !targetAddress}
                  className="px-8 py-3 bg-[#C3FF32] text-black rounded-xl font-bold text-sm tracking-tight hover:bg-[#b0e62e] transition-all duration-200 shadow-[0_0_20px_rgba(195,255,50,0.3)] hover:shadow-[0_0_30px_rgba(195,255,50,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {analyzing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search size={18} />
                      Analyze
                    </>
                  )}
                </button>
              </div>
              {progress && (
                <div className="mt-3 flex items-center gap-2 text-[#C3FF32] text-sm">
                  <Loader2 size={16} className="animate-spin" />
                  {progress}
                </div>
              )}
              {error && (
                <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          {insights && (
            <div className="space-y-6">
              {/* Wallet Overview */}
              <div className="bg-[#0E0E11] rounded-2xl border border-white/5 p-8 relative overflow-hidden group hover:border-[#C3FF32]/30 transition-all">
                <div className="absolute -inset-4 bg-[#C3FF32]/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <WalletIcon size={20} className="text-[#C3FF32]" />
                    Wallet Overview
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#050505] border border-white/5 rounded-xl p-6">
                      <p className="text-sm text-gray-400 mb-2">Native Balance</p>
                      <p className="text-2xl font-bold text-white">
                        {parseFloat(insights.balance).toFixed(4)} <span className="text-[#C3FF32] text-lg">AVAX</span>
                      </p>
                    </div>
                    <div className="bg-[#050505] border border-white/5 rounded-xl p-6">
                      <p className="text-sm text-gray-400 mb-2">Total Transactions</p>
                      <p className="text-2xl font-bold text-white">
                        {insights.totalTransactions}
                      </p>
                    </div>
                    <div className="bg-[#050505] border border-white/5 rounded-xl p-6">
                      <p className="text-sm text-gray-400 mb-2">First Seen</p>
                      <p className="text-2xl font-bold text-white">
                        {new Date(insights.firstSeen * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-[#050505] border border-white/5 rounded-xl p-6">
                      <p className="text-sm text-gray-400 mb-2">Total Sent</p>
                      <p className="text-xl font-bold text-red-400">
                        {parseFloat(insights.totalSent).toFixed(4)} AVAX
                      </p>
                    </div>
                    <div className="bg-[#050505] border border-white/5 rounded-xl p-6">
                      <p className="text-sm text-gray-400 mb-2">Total Received</p>
                      <p className="text-xl font-bold text-green-400">
                        {parseFloat(insights.totalReceived).toFixed(4)} AVAX
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-[#0E0E11] rounded-2xl border border-white/5 p-8 relative overflow-hidden group hover:border-[#C3FF32]/30 transition-all">
                <div className="absolute -inset-4 bg-[#C3FF32]/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <TrendingUp size={20} className="text-[#C3FF32]" />
                    Recent Activity
                  </h2>
                  
                  {insights.recentTx.length === 0 ? (
                    <div className="text-center py-12">
                      <AlertCircle size={48} className="text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">Transaction history coming soon</p>
                      <p className="text-sm text-gray-600 mt-2">Integrate with Snowtrace API for full history</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {insights.recentTx.map((tx, index) => (
                        <div
                          key={tx.hash}
                          className="bg-[#050505] border border-white/5 rounded-xl p-4 hover:border-[#C3FF32]/30 transition-all group/tx"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-mono text-gray-500">#{tx.blockNumber}</span>
                                <span className="text-xs text-gray-600">•</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(tx.timestamp * 1000).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm text-gray-400">From:</span>
                                <span className="text-sm font-mono text-white">
                                  {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-400">To:</span>
                                <span className="text-sm font-mono text-white">
                                  {tx.to ? `${tx.to.slice(0, 6)}...${tx.to.slice(-4)}` : 'Contract Creation'}
                                </span>
                              </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-2">
                              <p className="text-lg font-bold text-[#C3FF32]">
                                {parseFloat(tx.value).toFixed(4)} AVAX
                              </p>
                              <a
                                href={`https://testnet.snowtrace.io/tx/${tx.hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-gray-500 hover:text-[#C3FF32] transition-colors flex items-center gap-1"
                              >
                                View <ExternalLink size={12} />
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Token Holdings */}
              <div className="bg-[#0E0E11] rounded-2xl border border-white/5 p-8 relative overflow-hidden group hover:border-[#C3FF32]/30 transition-all">
                <div className="absolute -inset-4 bg-[#C3FF32]/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <WalletIcon size={20} className="text-[#C3FF32]" />
                    Token Holdings
                  </h2>
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-[#C3FF32]/10 border border-[#C3FF32]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <TrendingUp size={32} className="text-[#C3FF32]" />
                    </div>
                    <p className="text-gray-400 mb-2">Token scanning coming soon</p>
                    <p className="text-sm text-gray-600">
                      ERC-20 token balance tracking will be available in the next update
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!insights && !analyzing && (
            <div className="bg-[#0E0E11] rounded-2xl border border-white/5 p-16 text-center">
              <div className="w-20 h-20 bg-[#C3FF32]/10 border border-[#C3FF32]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Search size={40} className="text-[#C3FF32]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Start Your Analysis
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Enter any Avalanche wallet address above to view detailed insights, transaction history, and token holdings.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

