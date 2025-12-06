'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Navbar } from '@/components/ui'
import { 
  CheckoutButton, 
  SubscriptionStatus,
  AIAgentsPanel,
  MerchantDashboard
} from '../../../sdk'

export default function SDKDemoPage() {
  const { address } = useAccount()
  const [planId, setPlanId] = useState('')

  return (
    <div className="bg-[#0A0A0C] min-h-screen text-white font-sans">
      <Navbar />
      <main className="min-h-screen pt-32 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              synqpay SDK Demo
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Test and explore synqpay SDK components with live examples. All components feature the new dark theme UI.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Checkout Button */}
            <div className="bg-[#0E0E11] rounded-2xl border border-white/5 p-8">
              <h2 className="text-2xl font-bold text-white mb-4">CheckoutButton</h2>
              <p className="text-gray-400 text-sm mb-6">
                Pre-built checkout button component for payments and subscriptions
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Plan ID (optional)</label>
                  <input
                    type="text"
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                    placeholder="Leave empty for one-time payment"
                    className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
                  />
                </div>
                <CheckoutButton 
                  amount={0.001}
                  planId={planId || undefined}
                  label="Subscribe Now"
                />
              </div>
            </div>

            {/* Subscription Status */}
            <div className="bg-[#0E0E11] rounded-2xl border border-white/5 p-8">
              <h2 className="text-2xl font-bold text-white mb-4">SubscriptionStatus</h2>
              <p className="text-gray-400 text-sm mb-6">
                Display subscription status for any wallet address
              </p>
              {address ? (
                <SubscriptionStatus 
                  wallet={address}
                  showDetails={true}
                />
              ) : (
                <div className="bg-[#050505] border border-white/10 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Connect your wallet to see subscription status</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Agents Panel */}
          {address && (
            <div className="bg-[#0E0E11] rounded-2xl border border-white/5 p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">AIAgentsPanel</h2>
              <p className="text-gray-400 text-sm mb-6">
                Embeddable AI agents panel for merchants. Run invoice generation, renewal management, and analytics.
              </p>
              <AIAgentsPanel 
                merchantWallet={address}
              />
            </div>
          )}

          {/* Merchant Dashboard */}
          {address && (
            <div className="bg-[#0E0E11] rounded-2xl border border-white/5 p-8">
              <h2 className="text-2xl font-bold text-white mb-4">MerchantDashboard</h2>
              <p className="text-gray-400 text-sm mb-6">
                Embeddable dashboard widget showing revenue, subscriptions, and payment statistics.
              </p>
              <MerchantDashboard 
                merchantWallet={address}
                showChart={false}
              />
            </div>
          )}

          {!address && (
            <div className="bg-[#0E0E11] rounded-2xl border border-white/5 p-8 text-center">
              <p className="text-gray-400 mb-4">Connect your wallet to see AI Agents and Dashboard components</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
