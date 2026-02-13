import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || ''

/** Supabase client instance (null if env vars are missing) */
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null

/**
 * Returns the Supabase client or throws if not configured.
 * Use in API routes and server code that require DB access.
 */
export function ensureSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.'
    )
  }
  return supabase
}

/** Type guard: true when Supabase is configured and available */
export function isSupabaseConfigured(): boolean {
  return supabase !== null
}

export type Merchant = {
  id: string
  wallet: string
  api_key: string
  webhook_url?: string
  created_at: string
}

export type Payment = {
  id: string
  merchant_id: string
  payer: string
  amount: string
  tx_hash: string
  timestamp: string
  status: 'pending' | 'verified' | 'failed'
  created_at: string
}

export type Plan = {
  id: string
  merchant_id: string
  name: string
  amount: string
  interval: 'weekly' | 'monthly' | 'yearly'
  created_at: string
}

export type Subscription = {
  id: string
  merchant_id: string
  customer: string
  payer_wallet: string
  plan_id: string
  status: 'active' | 'canceled' | 'expired' | 'payment_required'
  current_period_end: number
  last_payment_tx?: string
  created_at: string
  updated_at: string
}

