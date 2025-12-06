import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { merchantAddress } from '@/lib/contract'

export function useToolAccess() {
  const { address: connectedAddress, isConnected } = useAccount()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null)

  useEffect(() => {
    if (isConnected && connectedAddress) {
      checkAccess()
    } else {
      setHasAccess(false)
      setLoading(false)
    }
  }, [connectedAddress, isConnected])

  const checkAccess = async () => {
    if (!connectedAddress) return

    try {
      setLoading(true)
      const response = await fetch('/api/access/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: connectedAddress,
          merchant: merchantAddress,
        }),
      })

      const data = await response.json()
      setHasAccess(data.access)

      if (data.access && data.subscription) {
        setSubscriptionInfo(data.subscription)
      }
    } catch (error) {
      console.error('Error checking access:', error)
      setHasAccess(false)
    } finally {
      setLoading(false)
    }
  }

  return {
    isConnected,
    connectedAddress,
    hasAccess,
    loading,
    subscriptionInfo,
    checkAccess,
  }
}

