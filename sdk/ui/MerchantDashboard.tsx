"use client"

import React, { useEffect, useState } from "react"
import { DollarSign, Users, BarChart3, TrendingUp, Loader2 } from "lucide-react"

export interface MerchantDashboardProps {
  merchantWallet: string
  className?: string
  showChart?: boolean
}

interface DashboardStats {
  totalRevenue: number
  totalPayments: number
  activeSubscriptions: number
  canceledSubscriptions: number
  expiredSubscriptions: number
  totalSubscriptions: number
}

export function MerchantDashboard({
  merchantWallet,
  className,
  showChart = false,
}: MerchantDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalPayments: 0,
    activeSubscriptions: 0,
    canceledSubscriptions: 0,
    expiredSubscriptions: 0,
    totalSubscriptions: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (merchantWallet) {
      fetchDashboardData()
    }
  }, [merchantWallet])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      const [paymentsResponse, subsResponse] = await Promise.all([
        fetch(`/api/payments/list?merchant=${merchantWallet}`),
        fetch(`/api/subscriptions/list?merchant=${merchantWallet}`)
      ])
      
      const paymentsData = await paymentsResponse.json()
      const subsData = await subsResponse.json()
      
      let totalRevenue = 0
      let totalPayments = 0
      let activeSubscriptions = 0
      let canceledSubscriptions = 0
      let expiredSubscriptions = 0
      let totalSubscriptions = 0
      
      if (paymentsResponse.ok && paymentsData) {
        totalRevenue = paymentsData.totalRevenue || 0
        totalPayments = paymentsData.count || 0
      }
      
      if (subsResponse.ok && subsData.subscriptions) {
        const subscriptions = subsData.subscriptions
        activeSubscriptions = subscriptions.filter((s: any) => s.status === 'active').length
        canceledSubscriptions = subscriptions.filter((s: any) => s.status === 'canceled').length
        expiredSubscriptions = subscriptions.filter((s: any) => s.status === 'expired').length
        totalSubscriptions = subscriptions.length
      }
      
      setStats({
        totalRevenue,
        totalPayments,
        activeSubscriptions,
        canceledSubscriptions,
        expiredSubscriptions,
        totalSubscriptions
      })
    } catch (err) {
      // Silent error handling
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={className || "bg-[#0E0E11] rounded-2xl border border-white/5 p-6"}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin h-6 w-6 text-[#C3FF32]" />
        </div>
      </div>
    )
  }

  return (
    <div className={className || "bg-[#0E0E11] rounded-2xl border border-white/5 p-6"}>
      <h3 className="text-xl font-bold text-white mb-6">Merchant Dashboard</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#050505] border border-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-[#C3FF32]/10 border border-[#C3FF32]/20 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-[#C3FF32]" />
            </div>
            <TrendingUp size={16} className="text-[#C3FF32]" />
          </div>
          <p className="text-gray-400 text-xs mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-white">
            {stats.totalRevenue.toFixed(4)} <span className="text-[#C3FF32] text-sm">AVAX</span>
          </p>
        </div>

        <div className="bg-[#050505] border border-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-[#C3FF32]/10 border border-[#C3FF32]/20 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-[#C3FF32]" />
            </div>
            <BarChart3 size={16} className="text-[#C3FF32]" />
          </div>
          <p className="text-gray-400 text-xs mb-1">Active Subscriptions</p>
          <p className="text-2xl font-bold text-white">
            {stats.activeSubscriptions}
          </p>
        </div>

        <div className="bg-[#050505] border border-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-[#C3FF32]/10 border border-[#C3FF32]/20 rounded-lg flex items-center justify-center">
              <BarChart3 size={20} className="text-[#C3FF32]" />
            </div>
            <TrendingUp size={16} className="text-[#C3FF32]" />
          </div>
          <p className="text-gray-400 text-xs mb-1">Total Payments</p>
          <p className="text-2xl font-bold text-white">
            {stats.totalPayments}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 bg-[#050505] border border-white/5 rounded-xl p-4">
        <div className="text-center">
          <p className="text-[#C3FF32] text-lg font-bold">{stats.activeSubscriptions}</p>
          <p className="text-gray-400 text-xs mt-1">Active</p>
        </div>
        <div className="text-center">
          <p className="text-red-400 text-lg font-bold">{stats.canceledSubscriptions}</p>
          <p className="text-gray-400 text-xs mt-1">Canceled</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-lg font-bold">{stats.expiredSubscriptions}</p>
          <p className="text-gray-400 text-xs mt-1">Expired</p>
        </div>
      </div>
    </div>
  )
}

