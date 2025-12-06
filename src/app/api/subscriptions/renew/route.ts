import { NextRequest, NextResponse } from 'next/server'
import { renewSubscription } from '@/lib/subscriptions'
import { triggerWebhook } from '@/lib/webhooks'
import { ensureSupabase } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { subscription_id, tx_hash } = body

    if (!subscription_id) {
      return NextResponse.json(
        { error: 'Missing required field: subscription_id' },
        { status: 400 }
      )
    }


    const supabase = ensureSupabase()
    const { data: subData } = await supabase
      .from('subscriptions')
      .select('merchant_id, current_period_end')
      .eq('id', subscription_id)
      .single()

    if (!subData) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    const now = Math.floor(Date.now() / 1000)
    if (subData.current_period_end > now) {
      return NextResponse.json(
        { error: 'Subscription not yet due for renewal' },
        { status: 400 }
      )
    }

    const subscription = await renewSubscription(subscription_id, tx_hash)

    await triggerWebhook('subscription_renewed', {
      merchant_id: subData.merchant_id,
      subscription_id: subscription.id,
      customer: subscription.payer_wallet,
      status: subscription.status,
      current_period_end: subscription.current_period_end,
      tx_hash,
    })

    return NextResponse.json({
      subscription_id: subscription.id,
      status: subscription.status,
      current_period_end: subscription.current_period_end,
      updated_at: subscription.updated_at,
    })
  } catch (error: any) {
    console.error('Error renewing subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to renew subscription' },
      { status: 500 }
    )
  }
}

