"use client"

import React, { useState } from "react"
import { FileText, RefreshCw, BarChart3, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import ReactMarkdown from "react-markdown"

export interface AIAgentsPanelProps {
  merchantWallet: string
  className?: string
  onAgentComplete?: (agent: string, result: any) => void
}

export function AIAgentsPanel({
  merchantWallet,
  className,
  onAgentComplete,
}: AIAgentsPanelProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const runAgent = async (agentName: string) => {
    setLoading(agentName)
    setError(null)
    setResult(null)

    try {
      const merchantId = await getMerchantId(merchantWallet)
      
      const response = await fetch('/api/agents/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: agentName,
          merchantId,
          merchantWallet,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Agent failed')
      }

      setResult(data)
      onAgentComplete?.(agentName, data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(null)
    }
  }

  const getMerchantId = async (wallet: string) => {
    try {
      const response = await fetch(`/api/plans/list?merchant=${wallet}`)
      const data = await response.json()
      return data.plans?.[0]?.merchant_id
    } catch {
      return null
    }
  }

  return (
    <div className={className || "bg-[#0E0E11] rounded-2xl border border-white/5 p-6"}>
      <h3 className="text-xl font-bold text-white mb-6">AI Agents</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Invoice Agent */}
        <div className="bg-[#050505] border border-white/5 rounded-xl p-6 relative overflow-hidden group hover:border-[#C3FF32]/30 transition-all">
          <div className="w-12 h-12 bg-[#C3FF32]/10 border border-[#C3FF32]/20 rounded-xl flex items-center justify-center mb-4">
            <FileText size={24} className="text-[#C3FF32]" />
          </div>
          <h4 className="text-lg font-bold text-white mb-2">Invoice Agent</h4>
          <p className="text-gray-400 text-sm mb-4">
            Generates invoices for verified payments
          </p>
          <button
            onClick={() => runAgent('invoice')}
            disabled={loading === 'invoice'}
            className="w-full px-4 py-2 bg-[#C3FF32] text-black rounded-lg hover:bg-[#b0e62e] transition-all font-bold disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
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

        {/* Renewal Agent */}
        <div className="bg-[#050505] border border-white/5 rounded-xl p-6 relative overflow-hidden group hover:border-[#C3FF32]/30 transition-all">
          <div className="w-12 h-12 bg-[#C3FF32]/10 border border-[#C3FF32]/20 rounded-xl flex items-center justify-center mb-4">
            <RefreshCw size={24} className="text-[#C3FF32]" />
          </div>
          <h4 className="text-lg font-bold text-white mb-2">Renewal Agent</h4>
          <p className="text-gray-400 text-sm mb-4">
            Manages expired subscriptions
          </p>
          <button
            onClick={() => runAgent('renew')}
            disabled={loading === 'renew'}
            className="w-full px-4 py-2 bg-[#C3FF32] text-black rounded-lg hover:bg-[#b0e62e] transition-all font-bold disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
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

        {/* Analytics Agent */}
        <div className="bg-[#050505] border border-white/5 rounded-xl p-6 relative overflow-hidden group hover:border-[#C3FF32]/30 transition-all">
          <div className="w-12 h-12 bg-[#C3FF32]/10 border border-[#C3FF32]/20 rounded-xl flex items-center justify-center mb-4">
            <BarChart3 size={24} className="text-[#C3FF32]" />
          </div>
          <h4 className="text-lg font-bold text-white mb-2">Analytics Agent</h4>
          <p className="text-gray-400 text-sm mb-4">
            Generates revenue insights
          </p>
          <button
            onClick={() => runAgent('analytics')}
            disabled={loading === 'analytics'}
            className="w-full px-4 py-2 bg-[#C3FF32] text-black rounded-lg hover:bg-[#b0e62e] transition-all font-bold disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {loading === 'analytics' ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Running...
              </>
            ) : (
              'Run Analytics Agent'
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
          <p className="text-red-400 font-semibold flex items-center gap-2 mb-1">
            <AlertCircle size={18} />
            Error
          </p>
          <p className="text-red-300/80 text-sm mt-1">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-[#050505] border border-white/5 rounded-xl p-6">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle2 size={20} className="text-[#C3FF32]" />
            Results
          </h4>
          
          {result.status && (
            <div className="mb-4">
              <span className="px-3 py-1 bg-[#C3FF32]/10 border border-[#C3FF32]/20 text-[#C3FF32] rounded-full text-xs font-semibold">
                Status: {result.status}
              </span>
            </div>
          )}

          {result.processed !== undefined && (
            <p className="text-gray-300 mb-3 text-sm">
              <strong className="text-white">Processed:</strong> {result.processed} invoices
            </p>
          )}

          {result.count !== undefined && (
            <p className="text-gray-300 mb-3 text-sm">
              <strong className="text-white">Renewed:</strong> {result.count} subscriptions
            </p>
          )}

          {result.metrics && (
            <div className="mb-4 grid grid-cols-3 gap-3 bg-white/5 border border-white/5 p-4 rounded-lg">
              <div>
                <p className="text-xs text-gray-400 mb-1">Revenue</p>
                <p className="text-sm font-bold text-[#C3FF32]">{result.metrics.totalRevenue} AVAX</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Payments</p>
                <p className="text-sm font-bold text-white">{result.metrics.paymentCount}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Active Subs</p>
                <p className="text-sm font-bold text-white">{result.metrics.activeSubscriptions}</p>
              </div>
            </div>
          )}

          {result.summary && (
            <div>
              <h5 className="text-sm font-semibold text-white mb-3">AI-Generated Insights</h5>
              <div className="bg-black/30 border border-white/5 rounded-lg p-4 prose prose-invert prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-code:text-[#C3FF32] prose-code:bg-white/5 prose-code:px-1 prose-code:py-0.5 prose-code:rounded max-w-none text-sm">
                <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-lg font-bold text-white mb-3 mt-4 first:mt-0" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-base font-bold text-white mb-2 mt-3 first:mt-0" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-sm font-semibold text-white mb-2 mt-2 first:mt-0" {...props} />,
                    p: ({node, ...props}) => <p className="text-gray-300 mb-2 leading-relaxed text-sm" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside mb-3 space-y-1 text-gray-300 text-sm" {...props} />,
                    li: ({node, ...props}) => <li className="text-gray-300 text-sm" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                    code: ({node, inline, ...props}: any) => 
                      inline ? (
                        <code className="bg-white/10 text-[#C3FF32] px-1.5 py-0.5 rounded text-xs font-mono" {...props} />
                      ) : (
                        <code className="block bg-white/5 text-gray-300 p-3 rounded-lg overflow-x-auto text-xs font-mono mb-3" {...props} />
                      ),
                  }}
                >
                  {result.summary}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

