'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

interface Subscription {
  id: string
  payer_wallet: string
  status: string
  current_period_end: number
  created_at: string
  plans: {
    name: string
    amount: string
    interval: string
  }
}

export default function SubscriptionsDashboard() {
  const { address } = useAccount()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (address) {
      fetchSubscriptions()
    }
  }, [address])

  const fetchSubscriptions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/subscriptions/list?merchant=${address}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch subscriptions')
      }

      setSubscriptions(data.subscriptions)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'canceled':
        return 'bg-red-100 text-red-800'
      case 'expired':
        return 'bg-gray-100 text-gray-800'
      case 'payment_required':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!address) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">Please connect your wallet to view subscriptions.</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Subscription Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage subscriptions for merchant: {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">Loading subscriptions...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800 font-semibold">Error</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">No subscriptions found for this merchant.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer Wallet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period End
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscriptions.map((sub) => (
                  <tr key={sub.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sub.payer_wallet.slice(0, 6)}...{sub.payer_wallet.slice(-4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sub.plans?.name || 'N/A'}
                      <span className="text-gray-500 text-xs ml-2">
                        ({sub.plans?.interval || 'N/A'})
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sub.plans?.amount ? (parseFloat(sub.plans.amount) / 1e18).toFixed(4) : '0'} AVAX
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(sub.status)}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(sub.current_period_end)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(sub.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-900 font-semibold text-sm">Total Subscriptions: {subscriptions.length}</p>
          <p className="text-blue-700 text-xs mt-1">
            Active: {subscriptions.filter(s => s.status === 'active').length} | 
            Canceled: {subscriptions.filter(s => s.status === 'canceled').length} | 
            Expired: {subscriptions.filter(s => s.status === 'expired').length}
          </p>
        </div>
      </div>
    </main>
  )
}

