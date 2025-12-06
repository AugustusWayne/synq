import { ensureSupabase } from './db'

export interface CreateSubscriptionParams {
  merchantId: string
  customer: string
  wallet: string
  planId: string
  txHash?: string
}

export async function createSubscription({
  merchantId,
  customer,
  wallet,
  planId,
  txHash,
}: CreateSubscriptionParams) {
  const supabase = ensureSupabase()

  const { data: plan } = await supabase
    .from('plans')
    .select('interval')
    .eq('id', planId)
    .single()

  if (!plan) {
    throw new Error('Plan not found')
  }

  const currentPeriodEnd = calculateNextBilling(plan.interval)

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      merchant_id: merchantId,
      customer,
      payer_wallet: wallet.toLowerCase(),
      plan_id: planId,
      status: 'active',
      current_period_end: currentPeriodEnd,
      last_payment_tx: txHash,
    })
    .select()
    .single()

  if (error) throw error

  return data
}

export async function renewSubscription(subId: string, txHash?: string) {
  const supabase = ensureSupabase()

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*, plans(*)')
    .eq('id', subId)
    .single()

  if (!subscription) {
    throw new Error('Subscription not found')
  }

  const newPeriodEnd = calculateNextBilling(subscription.plans.interval)

  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      current_period_end: newPeriodEnd,
      last_payment_tx: txHash || subscription.last_payment_tx,
      updated_at: new Date().toISOString(),
    })
    .eq('id', subId)
    .select()
    .single()

  if (error) throw error

  return data
}

export async function cancelSubscription(subId: string) {
  const supabase = ensureSupabase()

  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', subId)
    .select()
    .single()

  if (error) throw error

  return data
}

export function calculateNextBilling(interval: string): number {
  const now = Math.floor(Date.now() / 1000)

  switch (interval) {
    case 'weekly':
      return now + 7 * 24 * 3600
    case 'monthly':
      return now + 30 * 24 * 3600
    case 'yearly':
      return now + 365 * 24 * 3600
    default:
      return now
  }
}

export async function checkExpiredSubscriptions() {
  const supabase = ensureSupabase()
  const now = Math.floor(Date.now() / 1000)

  const { data: expired } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('status', 'active')
    .lt('current_period_end', now)

  if (expired && expired.length > 0) {
    await supabase
      .from('subscriptions')
      .update({ status: 'expired' })
      .in('id', expired.map((s: any) => s.id))

    // Marked subscriptions as expired
  }

  return expired || []
}

