import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || ''

export const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

export function ensureSupabase() {
  if (!supabase) {
    throw new Error('Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.')
  }
  return supabase
}

export type Merchant = {
  id: string
  wallet: string
  api_key: string
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

