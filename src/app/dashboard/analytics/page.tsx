'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'

export default function AnalyticsPage() {
  const { address } = useAccount()
  const [loading, setLoading] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

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
    <main className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Agent Dashboard</h1>
          <p className="text-gray-600">Powered by Gemini 2.0 Flash</p>
          {address && (
            <p className="text-sm text-gray-500 mt-2">
              Merchant: {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📄</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Invoice Agent</h3>
              <p className="text-gray-600 text-sm mb-4">
                Generates invoices for verified payments using AI
              </p>
            </div>
            <button
              onClick={() => runAgent('invoice')}
              disabled={loading === 'invoice'}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {loading === 'invoice' ? 'Running...' : 'Run Invoice Agent'}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Renewal Agent</h3>
              <p className="text-gray-600 text-sm mb-4">
                Manages expired subscriptions and sends renewal notices
              </p>
            </div>
            <button
              onClick={() => runAgent('renew')}
              disabled={loading === 'renew'}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
            >
              {loading === 'renew' ? 'Running...' : 'Run Renewal Agent'}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Analytics Agent</h3>
              <p className="text-gray-600 text-sm mb-4">
                Generates revenue insights and business recommendations
              </p>
            </div>
            <button
              onClick={() => runAgent('analytics')}
              disabled={loading === 'analytics' || !address}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400"
            >
              {loading === 'analytics' ? 'Running...' : 'Run Analytics Agent'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-semibold">Error</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Results</h2>
            
            {result.status && (
              <div className="mb-4">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                  Status: {result.status}
                </span>
              </div>
            )}

            {result.processed !== undefined && (
              <p className="text-gray-700 mb-2">
                <strong>Processed:</strong> {result.processed} invoices
              </p>
            )}

            {result.count !== undefined && (
              <p className="text-gray-700 mb-2">
                <strong>Renewed:</strong> {result.count} subscriptions
              </p>
            )}

            {result.metrics && (
              <div className="mb-4 grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-lg font-bold text-gray-900">{result.metrics.totalRevenue} AVAX</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payments</p>
                  <p className="text-lg font-bold text-gray-900">{result.metrics.paymentCount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Subs</p>
                  <p className="text-lg font-bold text-gray-900">{result.metrics.activeSubscriptions}</p>
                </div>
              </div>
            )}

            {result.summary && (
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">AI-Generated Insights</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                    {result.summary}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 font-semibold text-sm">⚡ Note</p>
          <p className="text-yellow-700 text-xs mt-1">
            Make sure to set GEMINI_API_KEY in your .env.local file to enable AI agents.
            Get your key from: https://aistudio.google.com/app/apikey
          </p>
        </div>
      </div>
    </main>
  )
}

