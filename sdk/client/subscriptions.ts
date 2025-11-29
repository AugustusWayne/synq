import { SubscriptionStatusData, Subscription, AccessResponse } from "../types"

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

  return await res.json()
}

export async function listSubscriptions(params: {
  merchant?: string
  customer?: string
}) {
  const searchParams = new URLSearchParams()
  if (params.merchant) searchParams.append("merchant", params.merchant)
  if (params.customer) searchParams.append("customer", params.customer)

  const res = await fetch(`/api/subscriptions/list?${searchParams.toString()}`)
  return await res.json()
}

