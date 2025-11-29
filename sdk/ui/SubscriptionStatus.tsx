"use client"

import React, { useEffect, useState } from "react"
import { getSubscriptionStatus } from "../client/subscriptions"
import type { SubscriptionStatusData } from "../types"

export interface SubscriptionStatusProps {
  wallet: string
  className?: string
  showDetails?: boolean
}

export function SubscriptionStatus({
  wallet,
  className,
  showDetails = true,
}: SubscriptionStatusProps) {
  const [status, setStatus] = useState<SubscriptionStatusData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (wallet) {
      loadStatus()
    }
  }, [wallet])

  async function loadStatus() {
    try {
      setLoading(true)
      const data = await getSubscriptionStatus(wallet)
      setStatus(data)
    } catch (error) {
      console.error("Failed to load subscription status:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={className || "text-gray-500 text-sm"}>
        Loading subscription status...
      </div>
    )
  }

  if (!status) {
    return (
      <div className={className || "text-gray-500 text-sm"}>
        Unable to load subscription status
      </div>
    )
  }

  if (!status.active) {
    return (
      <div className={className || "text-red-500 font-semibold text-sm"}>
        ⚠️ Subscription Inactive
      </div>
    )
  }

  return (
    <div className={className || "text-green-600 text-sm"}>
      <p className="font-semibold">✓ Active Subscription</p>
      {showDetails && status.current_period_end && (
        <p className="text-xs mt-1">
          Expires: {new Date(status.current_period_end * 1000).toLocaleDateString()}
        </p>
      )}
    </div>
  )
}

