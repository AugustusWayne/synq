'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/ui'
import { FileText, RefreshCw, BarChart3, Loader2, Zap, AlertCircle, CheckCircle2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function AnalyticsPage() {
  const { address } = useAccount()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isMerchant, setIsMerchant] = useState<boolean | null>(null)
  const [verifying, setVerifying] = useState(true)

  useEffect(() => {
    if (address) {
      verifyMerchant()
    } else {
      setVerifying(false)
    }
  }, [address])

  const verifyMerchant = async () => {
    try {
      setVerifying(true)
      const response = await fetch('/api/merchants/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: address })
      })
      const data = await response.json()
      setIsMerchant(data.isMerchant)
    } catch (error) {
      console.error('Error verifying merchant:', error)
      setIsMerchant(false)
    } finally {
      setVerifying(false)
    }
  }

  if (verifying) {
    return (
      <div className="bg-[#0A0A0C] min-h-screen text-white font-sans">
        <Navbar />
        <main className="min-h-screen pt-32 pb-16 px-4 flex items-center justify-center">
          <div className="bg-[#0E0E11] rounded-2xl border border-white/5 p-8 text-center max-w-md">
            <Loader2 className="animate-spin h-8 w-8 text-[#C3FF32] mx-auto mb-4" />
            <p className="text-gray-400">Verifying merchant access...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!address) {
    return (
      <div className="bg-[#0A0A0C] min-h-screen text-white font-sans">
        <Navbar />
        <main className="min-h-screen pt-32 pb-16 px-4 flex items-center justify-center">
          <div className="bg-[#0E0E11] rounded-2xl border border-white/5 p-8 text-center max-w-md">
            <p className="text-xl font-bold text-white mb-4">Merchant Access Required</p>
            <p className="text-gray-400 mb-6">Please connect your wallet to access AI agents.</p>
            <p className="text-sm text-gray-500">This dashboard is restricted to registered merchants only.</p>
          </div>
        </main>
      </div>
    )
  }

  if (isMerchant === false) {
    return (
      <div className="bg-[#0A0A0C] min-h-screen text-white font-sans">
        <Navbar />
        <main className="min-h-screen pt-32 pb-16 px-4 flex items-center justify-center">
          <div className="bg-[#0E0E11] rounded-2xl border border-red-500/10 p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-red-400" />
            </div>
            <p className="text-xl font-bold text-white mb-4">Merchant Analytics</p>
            <p className="text-gray-400 mb-6">
              AI-powered analytics dashboard is for merchants only. Your wallet <span className="font-mono text-gray-500">{address.slice(0,6)}...{address.slice(-4)}</span> is not registered.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              To become a merchant and access AI agents, receive payments through synqpay.
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-[#C3FF32] text-black rounded-lg hover:bg-[#b0e62e] transition-all font-bold"
            >
              Go to Homepage
            </button>
          </div>
        </main>
      </div>
    )
  }

  const runAgent = async (agentName: string) => {
    setLoading(agentName)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/agents/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: agentName,
          merchantId: address ? await getMerchantId(address) : null,
          merchantWallet: address,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Agent failed')
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(null)
    }
  }

  const getMerchantId = async (wallet: string) => {
    const response = await fetch(`/api/plans/list?merchant=${wallet}`)
    const data = await response.json()
    return data.plans?.[0]?.merchant_id
  }

  return (
    <div className="bg-[#0A0A0C] min-h-screen text-white font-sans">
      <Navbar />
      <main className="min-h-screen pt-32 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Background glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#C3FF32]/5 blur-[120px] rounded-full"></div>
          </div>

          <div className="relative z-10 mb-12">
          
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">AI Agent Dashboard</h1>
            <p className="text-gray-400 text-lg">Automate invoicing, renewals, and analytics with AI agents</p>
            {address && (
              <p className="text-sm text-gray-500 mt-3 font-mono">
                Merchant: {address.slice(0, 6)}...{address.slice(-4)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Left Column: Invoice + Renewal Stacked */}
            <div className="md:col-span-1 flex flex-col gap-6">
              {/* Invoice Agent */}
              <div className="bg-[#0E0E11] rounded-2xl border border-[#C3FF32]/20 p-6 relative overflow-hidden group hover:border-[#C3FF32]/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(195,255,50,0.3)]">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C3FF32]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute -inset-4 bg-[#C3FF32]/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-[#C3FF32]/10 border border-[#C3FF32]/20 rounded-xl flex items-center justify-center mb-4">
                    <FileText size={24} className="text-[#C3FF32]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Invoice Agent</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Generates invoices for verified payments using AI
                  </p>
                  <button
                    onClick={() => runAgent('invoice')}
                    disabled={loading === 'invoice'}
                    className="w-full px-4 py-3 bg-[#C3FF32] text-black rounded-lg hover:bg-[#b0e62e] transition-all font-bold disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(195,255,50,0.3)] disabled:shadow-none"
                  >
                    {loading === 'invoice' ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Running...
                      </>
                    ) : (
                      'Run Invoice Agent'
                    )}
                  </button>
                </div>
              </div>

              {/* Renewal Agent */}
              <div className="bg-[#0E0E11] rounded-2xl border border-[#C3FF32]/20 p-6 relative overflow-hidden group hover:border-[#C3FF32]/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(195,255,50,0.3)]">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C3FF32]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute -inset-4 bg-[#C3FF32]/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-[#C3FF32]/10 border border-[#C3FF32]/20 rounded-xl flex items-center justify-center mb-4">
                    <RefreshCw size={24} className="text-[#C3FF32]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Renewal Agent</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Manages expired subscriptions and sends renewal notices
                  </p>
                  <button
                    onClick={() => runAgent('renew')}
                    disabled={loading === 'renew'}
                    className="w-full px-4 py-3 bg-[#C3FF32] text-black rounded-lg hover:bg-[#b0e62e] transition-all font-bold disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(195,255,50,0.3)] disabled:shadow-none"
                  >
                    {loading === 'renew' ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Running...
                      </>
                    ) : (
                      'Run Renewal Agent'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Analytics Tall Card */}
            <div className="md:col-span-2 bg-[#0E0E11] rounded-2xl border border-[#C3FF32]/20 p-8 relative overflow-hidden group hover:border-[#C3FF32]/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(195,255,50,0.3)]">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C3FF32]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute -inset-4 bg-[#C3FF32]/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 h-full flex flex-col">
                <div className="w-16 h-16 bg-[#C3FF32]/10 border border-[#C3FF32]/20 rounded-xl flex items-center justify-center mb-6">
                  <BarChart3 size={32} className="text-[#C3FF32]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Analytics Agent</h3>
                <p className="text-gray-400 text-base mb-6 flex-grow">
                  Generates comprehensive revenue insights, business recommendations, and detailed analytics summaries using AI-powered analysis of your payment and subscription data.
                </p>
                <button
                  onClick={() => runAgent('analytics')}
                  disabled={loading === 'analytics' || !address}
                  className="w-full px-6 py-4 bg-[#C3FF32] text-black rounded-lg hover:bg-[#b0e62e] transition-all font-bold disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(195,255,50,0.3)] disabled:shadow-none text-lg"
                >
                  {loading === 'analytics' ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Running...
                    </>
                  ) : (
                    'Run Analytics Agent'
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
              <p className="text-red-400 font-semibold flex items-center gap-2 mb-1">
                <AlertCircle size={18} />
                Error
              </p>
              <p className="text-red-300/80 text-sm mt-1">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-[#0E0E11] rounded-2xl border border-white/5 p-8 mb-8 relative overflow-hidden group hover:border-[#C3FF32]/30 transition-all">
              <div className="absolute -inset-4 bg-[#C3FF32]/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <CheckCircle2 size={24} className="text-[#C3FF32]" />
                  Results
                </h2>
                
                {result.status && (
                  <div className="mb-6">
                    <span className="px-4 py-2 bg-[#C3FF32]/10 border border-[#C3FF32]/20 text-[#C3FF32] rounded-full text-sm font-semibold">
                      Status: {result.status}
                    </span>
                  </div>
                )}

                {result.processed !== undefined && (
                  <div className="mb-6">
                    <p className="text-gray-300 mb-3">
                      <strong className="text-white">Processed:</strong> {result.processed} invoices
                    </p>
                    
                    {result.invoices && result.invoices.length > 0 && (
                      <div className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-3">
                        <p className="text-sm font-semibold text-white mb-3">Generated Invoices:</p>
                        {result.invoices.map((inv: any) => (
                          <div key={inv.id} className="bg-[#050505] border border-white/5 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="text-[#C3FF32] font-mono font-bold text-sm">{inv.invoice_number}</p>
                                <p className="text-gray-400 text-xs mt-1">Amount: {inv.amount} AVAX</p>
                              </div>
                              <button
                                onClick={() => {
                                  const blob = new Blob([inv.text], { type: 'text/plain' })
                                  const url = URL.createObjectURL(blob)
                                  const a = document.createElement('a')
                                  a.href = url
                                  a.download = `${inv.invoice_number}.txt`
                                  a.click()
                                  URL.revokeObjectURL(url)
                                }}
                                className="px-3 py-1 bg-[#C3FF32]/10 hover:bg-[#C3FF32]/20 border border-[#C3FF32]/20 text-[#C3FF32] rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                              >
                                <FileText size={12} />
                                Download
                              </button>
                            </div>
                            <pre className="text-xs text-gray-400 whitespace-pre-wrap font-mono bg-black/30 p-3 rounded mt-2 max-h-32 overflow-y-auto">
                              {inv.text}
                            </pre>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {result.count !== undefined && (
                  <p className="text-gray-300 mb-3">
                    <strong className="text-white">Renewed:</strong> {result.count} subscriptions
                  </p>
                )}

                {result.metrics && (
                  <div className="mb-6 grid grid-cols-2 md:grid-cols-3 gap-4 bg-white/5 border border-white/5 p-6 rounded-xl">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Total Revenue</p>
                      <p className="text-xl font-bold text-[#C3FF32]">{result.metrics.totalRevenue} AVAX</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Payments</p>
                      <p className="text-xl font-bold text-white">{result.metrics.paymentCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Active Subs</p>
                      <p className="text-xl font-bold text-white">{result.metrics.activeSubscriptions}</p>
                    </div>
                  </div>
                )}

                {result.summary && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">AI-Generated Insights</h3>
                    <div className="bg-[#050505] border border-white/5 rounded-xl p-6 prose prose-invert prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-ul:text-gray-300 prose-li:text-gray-300 prose-code:text-[#C3FF32] prose-code:bg-white/5 prose-code:px-1 prose-code:py-0.5 prose-code:rounded max-w-none">
                      <ReactMarkdown
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-white mb-4 mt-6 first:mt-0" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-xl font-bold text-white mb-3 mt-5 first:mt-0" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-white mb-2 mt-4 first:mt-0" {...props} />,
                          p: ({node, ...props}) => <p className="text-gray-300 mb-3 leading-relaxed" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-1 text-gray-300" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-300" {...props} />,
                          li: ({node, ...props}) => <li className="text-gray-300" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                          code: ({node, inline, ...props}: any) => 
                            inline ? (
                              <code className="bg-white/10 text-[#C3FF32] px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                            ) : (
                              <code className="block bg-white/5 text-gray-300 p-4 rounded-lg overflow-x-auto text-sm font-mono mb-4" {...props} />
                            ),
                          pre: ({node, ...props}) => <pre className="bg-white/5 p-4 rounded-lg overflow-x-auto mb-4" {...props} />,
                        }}
                      >
                        {result.summary}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          
        </div>
      </main>
    </div>
  )
}

