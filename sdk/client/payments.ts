import { VerifyResponse, CheckoutOptions } from "../types"

export async function verifyPayment(
  txHash: string,
  merchant: string,
  amount: number,
  planId?: string
): Promise<VerifyResponse> {
  const res = await fetch("/api/payments/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      txHash,
      merchant,
      amount,
      plan_id: planId,
      create_subscription: !!planId,
    }),
  })

  if (!res.ok) {
    throw new Error(`Payment verification failed: ${res.statusText}`)
  }

  return (await res.json()) as VerifyResponse
}

export function createCheckoutUrl(opts: {
  planId?: string
  amount: number
}): string {
  const params = new URLSearchParams()
  params.append("amount", String(opts.amount))
  if (opts.planId) params.append("plan", opts.planId)

  return `/checkout-demo?${params.toString()}`
}

export async function getPaymentHistory(merchantId: string) {
  const res = await fetch(`/api/payments/list?merchant=${merchantId}`)
  return await res.json()
}

