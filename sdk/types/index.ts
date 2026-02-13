export interface CheckoutOptions {
  amount: number
  merchant: string
  planId?: string
}

export interface VerifyResponse {
  verified: boolean
  payer: string
  merchant: string
  timestamp: string
  amount: string
  payment_id: string
  subscription?: {
    subscription_id: string
    status: string
    current_period_end: number
  }
}

export interface SubscriptionStatusData {
  active: boolean
  subscription_id?: string
  plan?: string
  current_period_end?: number
  status?: 'active' | 'canceled' | 'expired' | 'payment_required'
}

export interface Plan {
  id: string
  name: string
  amount: string
  interval: 'weekly' | 'monthly' | 'yearly'
  merchant_id: string
}

export interface Subscription {
  id: string
  merchant_id: string
  /** Customer wallet address (alias for payer_wallet in API responses) */
  customer?: string
  payer_wallet: string
  plan_id: string
  status: 'active' | 'canceled' | 'expired' | 'payment_required'
  current_period_end: number
  created_at?: string
  updated_at?: string
}

export interface AccessResponse {
  access: boolean
  reason?: string
  subscription?: {
    id: string
    plan: string
    expires: number
  }
}

