import { Lock, RefreshCw, WalletIcon } from 'lucide-react'
import { AvaxCheckout } from '@/components/checkout'

interface LockedStateProps {
  connectedAddress?: string
  showCheckout: boolean
  setShowCheckout: (value: boolean) => void
  onCheckAccess: () => void
}

export function LockedState({
  connectedAddress,
  showCheckout,
  setShowCheckout,
  onCheckAccess
}: LockedStateProps) {
  return (
    <div className="bg-[#0A0A0C] min-h-screen text-white font-sans">
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
              {connectedAddress ? 'Premium Tool Locked' : 'Contract Inspector'}
            </h1>
            <p className="text-gray-400 text-lg mb-2 max-w-xl mx-auto">
              {connectedAddress 
                ? 'Contract Inspector requires an active subscription.'
                : 'Premium tool for deep contract analysis. Connect your wallet to access.'
              }
            </p>
            {connectedAddress && (
              <p className="text-sm text-gray-500 mb-12 font-mono">
                {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
              </p>
            )}

            <div className="bg-[#0E0E11] rounded-2xl border border-white/5 p-8 relative overflow-hidden group hover:border-[#C3FF32]/30 transition-all">
              <div className="absolute -inset-4 bg-[#C3FF32]/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                {connectedAddress ? (
                  showCheckout ? (
                    <AvaxCheckout 
                      onSuccess={() => {
                        setShowCheckout(false)
                        onCheckAccess()
                      }}
                    />
                  ) : (
                    <>
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
                      <button
                        onClick={onCheckAccess}
                        className="mt-6 text-sm text-gray-400 hover:text-[#C3FF32] transition-colors flex items-center justify-center gap-2 mx-auto"
                      >
                        <RefreshCw size={14} />
                        Already subscribed? Refresh
                      </button>
                    </>
                  )
                ) : (
                  <button
                    onClick={() => window.location.href = '/checkout-demo'}
                    className="px-10 py-4 bg-[#C3FF32] text-black rounded-xl font-bold text-base tracking-tight hover:bg-[#b0e62e] transition-all duration-200 shadow-[0_0_30px_rgba(195,255,50,0.4)] hover:shadow-[0_0_40px_rgba(195,255,50,0.5)] active:scale-[0.98] flex items-center justify-center gap-2 mx-auto"
                  >
                    <WalletIcon size={20} />
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

