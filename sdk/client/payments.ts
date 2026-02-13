import { VerifyResponse, CheckoutOptions } from "../types"

/**
 * Verifies a payment transaction on-chain and optionally creates a subscription.
 * @param txHash - Transaction hash of the payment
 * @param merchant - Merchant wallet address
 * @param amount - Amount in AVAX
 * @param planId - Optional plan ID to create a subscription
 * @returns VerifyResponse with verification result and optional subscription details
 */
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

/**
 * Builds a checkout URL with amount and optional plan ID.
 * @param opts - Amount and optional planId
 * @returns Relative checkout URL with query params
 */
export function createCheckoutUrl(opts: {
  planId?: string
  amount: number
}): string {
  const params = new URLSearchParams()
  params.append("amount", String(opts.amount))
  if (opts.planId) params.append("plan", opts.planId)

  return `/checkout-demo?${params.toString()}`
}

/**
 * Fetches payment history for a merchant.
 * @param merchantId - Merchant ID or wallet to list payments for
 * @returns Payment list response from API
 */
export async function getPaymentHistory(merchantId: string) {
  const res = await fetch(`/api/payments/list?merchant=${merchantId}`)
  return await res.json()
}

