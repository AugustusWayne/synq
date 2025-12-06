'use client'

import { useState } from 'react'
import { CheckCircle2, Search, Code2, TrendingUp, ArrowRight, Lock } from 'lucide-react'
import Link from 'next/link'
import { ToolHeader, ToolLayout, ToolLoadingState, useToolAccess } from '@/components/tools'
import CheckoutModal from '@/components/checkout/CheckoutModal'

const tools = [
  {
    id: 'address-insights',
    title: 'Address Insights',
    description: 'Deep wallet analysis with transaction history, token holdings, and activity metrics',
    icon: Search,
    href: '/tools/address-insights',
    color: 'text-[#C3FF32]'
  },
  {
    id: 'contract-inspector',
    title: 'Contract Inspector',
    description: 'Analyze smart contracts, view ABI, functions, verification status, and bytecode',
    icon: Code2,
    href: '/tools/contract-inspector',
    color: 'text-[#C3FF32]'
  },
  {
    id: 'wallet-score',
    title: 'Wallet Reputation Score',
    description: 'Behavior-based scoring for EVM wallets using on-chain activity analysis',
    icon: TrendingUp,
    href: '/tools/wallet-score',
    color: 'text-[#C3FF32]'
  }
]

export default function ToolsPage() {
  const { isConnected, connectedAddress, hasAccess, loading, subscriptionInfo, checkAccess } = useToolAccess()
  const [showCheckout, setShowCheckout] = useState(false)

  if (loading) {
    return <ToolLoadingState />
  }

  return (
    <ToolLayout>
      <ToolHeader
        icon={Search}
        title="Premium Tools"
        description="Advanced blockchain analysis tools for Avalanche"
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
                  ? 'Connect your wallet and subscribe to unlock premium tools'
                  : 'Subscribe to unlock all premium blockchain analysis tools'}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => {
          const Icon = tool.icon
          return (
            <Link
              key={tool.id}
              href={tool.href}
              className="bg-[#0E0E11] rounded-2xl border border-white/5 p-8 relative overflow-hidden group hover:border-[#C3FF32]/30 transition-all"
            >
              <div className="absolute -inset-4 bg-[#C3FF32]/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-[#C3FF32]/10 border border-[#C3FF32]/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#C3FF32]/20 transition-colors">
                  <Icon size={24} className={tool.color} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{tool.title}</h3>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">{tool.description}</p>
                <div className="flex items-center gap-2 text-[#C3FF32] text-sm font-semibold group-hover:gap-3 transition-all">
                  <span>Open Tool</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

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
