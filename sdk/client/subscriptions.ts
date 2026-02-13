import { SubscriptionStatusData, Subscription, AccessResponse } from "../types"

/**
 * Gets subscription status for a customer wallet.
 * @param wallet - Customer wallet address
 * @returns SubscriptionStatusData with active flag and optional subscription details
 */
export async function getSubscriptionStatus(wallet: string): Promise<SubscriptionStatusData> {
  const res = await fetch(`/api/subscriptions/list?customer=${wallet}`)
  const data = await res.json()

  if (!data.subscriptions || data.subscriptions.length === 0) {
    return { active: false }
  }

  const activeSub = data.subscriptions.find(
    (s: Subscription) => s.status === 'active'
  )

  if (!activeSub) {
    return { active: false }
  }

  return {
    active: true,
    subscription_id: activeSub.id,
    plan: activeSub.plan_id,
    current_period_end: activeSub.current_period_end,
    status: activeSub.status,
  }
}

/**
 * Checks if a wallet has active subscription access for a merchant/plan.
 * @param wallet - Customer wallet address
 * @param merchant - Merchant wallet address
 * @param planId - Optional plan ID to check against
 * @returns AccessResponse with access boolean and optional subscription info
 */
export async function checkAccess(
  wallet: string,
  merchant: string,
  planId?: string
): Promise<AccessResponse> {
  const res = await fetch("/api/access/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      wallet,
      merchant,
      plan_id: planId,
    }),
  })

  return await res.json()
}

/**
 * Cancels an active subscription by ID.
 * @param subscriptionId - Subscription UUID to cancel
 * @returns API response with success or error
 */
export async function cancelSubscription(subscriptionId: string) {
  const res = await fetch("/api/subscriptions/cancel", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      subscription_id: subscriptionId,
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    const message = (data?.error ?? data?.message ?? res.statusText) as string
    throw new Error(`Cancel subscription failed: ${message}`)
  }
  return data
}

/**
 * Lists subscriptions filtered by merchant and/or customer.
 * @param params - Optional merchant and customer wallet filters
 * @returns API response with subscriptions array and count
 */
export async function listSubscriptions(params: {
  merchant?: string
  customer?: string
}) {
  const searchParams = new URLSearchParams()
  if (params.merchant) searchParams.append("merchant", params.merchant)
  if (params.customer) searchParams.append("customer", params.customer)

  const res = await fetch(`/api/subscriptions/list?${searchParams.toString()}`)
  const data = await res.json()
  if (!res.ok) {
    const message = (data?.error ?? data?.message ?? res.statusText) as string
    throw new Error(`Failed to list subscriptions: ${message}`)
  }
  return data
}

