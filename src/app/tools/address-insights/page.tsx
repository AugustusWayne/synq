'use client'

import { useState } from 'react'
import { usePublicClient } from 'wagmi'
import { Search, Lock, Loader2 } from 'lucide-react'
import { formatEther, isAddress, type Address } from 'viem'
import { AvaxCheckout } from '@/components/checkout'
import CheckoutModal from '@/components/checkout/CheckoutModal'
import { ToolHeader, ToolLayout, ToolLoadingState, useToolAccess } from '@/components/tools'

interface AddressInsights {
  balance: string
  tokenCount: number
  totalTransactions: number
  totalSent: string
  totalReceived: string
  firstSeen: number
  tokens: any[]
  recentTx: any[]
}

export default function AddressInsightsPage() {
  const { isConnected, connectedAddress, hasAccess, loading, subscriptionInfo, checkAccess } = useToolAccess()
  const publicClient = usePublicClient()
  const [showCheckout, setShowCheckout] = useState(false)

  const [targetAddress, setTargetAddress] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [insights, setInsights] = useState<AddressInsights | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<string>('')

  const analyzeAddress = async () => {
    // Check subscription first
    if (!hasAccess) {
      setError('Active subscription required')
      setShowCheckout(true)
      return
    }

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
      setError(err.message || 'Failed to analyze address')
    } finally {
      setAnalyzing(false)
      setProgress('')
    }
  }

  if (loading) {
    return <ToolLoadingState />
  }

  return (
    <ToolLayout>
      <ToolHeader
        icon={Search}
        title="Address Insights"
        description="Deep wallet analysis for Avalanche addresses"
        hasSubscription={!!hasAccess}
      />

      {/* Subscription Banner */}
      {!hasAccess && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Lock size={20} className="text-yellow-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-yellow-500 font-semibold">Subscription Required</p>
              <p className="text-gray-400 text-sm mt-1">
                {!isConnected 
                  ? 'Connect your wallet and subscribe to unlock this tool'
                  : 'Subscribe to unlock advanced address analysis features'}
              </p>
            </div>
            {isConnected && (
              <button
                onClick={() => setShowCheckout(true)}
                className="px-4 py-2 bg-[#C3FF32] text-black rounded-lg hover:bg-[#b0e62e] transition-all font-bold text-sm"
              >
                Subscribe
              </button>
            )}
          </div>
        </div>
      )}

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
              disabled={!hasAccess}
              placeholder={hasAccess ? "0x..." : "Subscribe to unlock"}
              className="flex-1 bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#C3FF32]/50 focus:ring-2 focus:ring-[#C3FF32]/20 transition-all font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={analyzeAddress}
              disabled={analyzing || !targetAddress || !hasAccess}
              className="px-8 py-3 bg-[#C3FF32] text-black rounded-xl font-bold text-sm tracking-tight hover:bg-[#b0e62e] transition-all duration-200 shadow-[0_0_20px_rgba(195,255,50,0.3)] hover:shadow-[0_0_30px_rgba(195,255,50,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-400 disabled:shadow-none flex items-center gap-2"
            >
              {analyzing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze'
              )}
            </button>
          </div>
          {progress && <div className="mt-3 text-[#C3FF32] text-sm">{progress}</div>}
          {error && <div className="mt-3 text-red-400 text-sm">{error}</div>}
        </div>
      </div>

      {insights && (
        <div className="bg-[#0E0E11] rounded-2xl border border-white/5 p-8 relative overflow-hidden group hover:border-[#C3FF32]/30 transition-all">
          <div className="absolute -inset-4 bg-[#C3FF32]/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-white mb-6">Wallet Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#050505] border border-white/5 rounded-xl p-6">
                <p className="text-sm text-gray-400 mb-2">Native Balance</p>
                <p className="text-2xl font-bold text-white">
                  {parseFloat(insights.balance).toFixed(4)} <span className="text-[#C3FF32] text-lg">AVAX</span>
                </p>
              </div>
              <div className="bg-[#050505] border border-white/5 rounded-xl p-6">
                <p className="text-sm text-gray-400 mb-2">Total Transactions</p>
                <p className="text-2xl font-bold text-white">{insights.totalTransactions}</p>
              </div>
              <div className="bg-[#050505] border border-white/5 rounded-xl p-6">
                <p className="text-sm text-gray-400 mb-2">First Seen</p>
                <p className="text-2xl font-bold text-white">
                  {new Date(insights.firstSeen * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!insights && !analyzing && (
        <div className="bg-[#0E0E11] rounded-2xl border border-white/5 p-16 text-center">
          <div className="w-20 h-20 bg-[#C3FF32]/10 border border-[#C3FF32]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Search size={40} className="text-[#C3FF32]" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">
            {hasAccess ? 'Start Your Analysis' : 'Subscribe to Unlock'}
          </h3>
          <p className="text-gray-400 max-w-md mx-auto">
            {hasAccess 
              ? 'Enter any Avalanche wallet address above to view detailed insights, transaction history, and token holdings.'
              : 'Get access to advanced address analysis tools with a subscription.'}
          </p>
        </div>
      )}

      {showCheckout && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {
            setShowCheckout(false)
            checkAccess()
          }}
        />
      )}
    </ToolLayout>
  )
}
