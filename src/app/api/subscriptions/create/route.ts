import { NextRequest, NextResponse } from 'next/server'
import { createSubscription } from '@/lib/subscriptions'
import { triggerWebhook } from '@/lib/webhooks'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { merchant_id, customer_wallet, plan_id, tx_hash } = body

    if (!merchant_id || !customer_wallet || !plan_id) {
      return NextResponse.json(
        { error: 'Missing required fields: merchant_id, customer_wallet, plan_id' },
        { status: 400 }
      )
    }


    const subscription = await createSubscription({
      merchantId: merchant_id,
      customer: customer_wallet,
      wallet: customer_wallet,
      planId: plan_id,
      txHash: tx_hash,
    })

    await triggerWebhook('subscription_created', {
      merchant_id,
      subscription_id: subscription.id,
      customer: customer_wallet,
      plan_id: plan_id,
      status: subscription.status,
      current_period_end: subscription.current_period_end,
    })

    return NextResponse.json({
      subscription_id: subscription.id,
      status: subscription.status,
      current_period_end: subscription.current_period_end,
      created_at: subscription.created_at,
    })
  } catch (error: any) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    )
  }
}

