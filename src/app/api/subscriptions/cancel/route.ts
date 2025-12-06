import { NextRequest, NextResponse } from 'next/server'
import { cancelSubscription } from '@/lib/subscriptions'
import { triggerWebhook } from '@/lib/webhooks'
import { ensureSupabase } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { subscription_id } = body

    if (!subscription_id) {
      return NextResponse.json(
        { error: 'Missing required field: subscription_id' },
        { status: 400 }
      )
    }


    const supabase = ensureSupabase()
    const { data: subData } = await supabase
      .from('subscriptions')
      .select('merchant_id')
      .eq('id', subscription_id)
      .single()

    if (!subData) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    const subscription = await cancelSubscription(subscription_id)

    if (subData.merchant_id) {
      await triggerWebhook('subscription_canceled', {
        merchant_id: subData.merchant_id,
        subscription_id: subscription.id,
        customer: subscription.payer_wallet,
        status: subscription.status,
      })
    }

    return NextResponse.json({
      subscription_id: subscription.id,
      status: subscription.status,
      updated_at: subscription.updated_at,
    })
  } catch (error: any) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}

