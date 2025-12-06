import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { avalancheFuji } from 'viem/chains'
import { paymentsAbi, paymentsAddress } from '@/lib/contract'
import { ensureSupabase } from '@/lib/db'
import { triggerWebhook } from '@/lib/webhooks'
import { createSubscription } from '@/lib/subscriptions'

const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http(),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = ensureSupabase()
    
    const body = await req.json()
    const { txHash, merchant, amount, plan_id, create_subscription } = body

    if (!txHash || !merchant || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: txHash, merchant, amount' },
        { status: 400 }
      )
    }

    const transaction = await publicClient.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found', verified: false },
        { status: 404 }
      )
    }

    const logs = await publicClient.getLogs({
      address: paymentsAddress,
      event: parseAbiItem('event PaymentReceived(address indexed merchant, address indexed payer, uint256 amount, uint256 timestamp)'),
      fromBlock: transaction.blockNumber,
      toBlock: transaction.blockNumber,
    })

    const matchingLog = logs.find(
      (log: any) => 
        log.transactionHash?.toLowerCase() === txHash.toLowerCase() &&
        log.args?.merchant?.toLowerCase() === merchant.toLowerCase()
    )

    if (!matchingLog) {
      return NextResponse.json(
        { error: 'Payment event not found for this transaction', verified: false },
        { status: 404 }
      )
    }

    const eventData = matchingLog.args as {
      merchant: string
      payer: string
      amount: bigint
      timestamp: bigint
    }

    const { data: merchantData } = await supabase
      .from('merchants')
      .select('id')
      .eq('wallet', merchant.toLowerCase())
      .single()

    let merchantId = merchantData?.id

    if (!merchantId) {
      const { data: newMerchant, error } = await supabase
        .from('merchants')
        .insert({
          wallet: merchant.toLowerCase(),
          api_key: `sk_${Math.random().toString(36).substring(2)}${Date.now()}`,
        })
        .select('id')
        .single()

      if (error) {
        console.error('Error creating merchant:', error)
        return NextResponse.json(
          { error: 'Failed to create merchant', verified: false },
          { status: 500 }
        )
      }

      merchantId = newMerchant.id
    }

    const { data: paymentRecord, error: paymentError } = await supabase
      .from('payments')
      .insert({
        merchant_id: merchantId,
        payer: eventData.payer.toLowerCase(),
        amount: eventData.amount.toString(),
        tx_hash: txHash.toLowerCase(),
        timestamp: eventData.timestamp.toString(),
        status: 'verified',
      })
      .select()
      .single()

    if (paymentError) {
      if (paymentError.code === '23505') {
        return NextResponse.json({
          verified: true,
          message: 'Payment already recorded',
          payer: eventData.payer,
          merchant: eventData.merchant,
          amount: eventData.amount.toString(),
          timestamp: eventData.timestamp.toString(),
        })
      }

      console.error('Error saving payment:', paymentError)
      return NextResponse.json(
        { error: 'Failed to save payment', verified: false },
        { status: 500 }
      )
    }

    await triggerWebhook('payment_succeeded', {
      merchant_id: merchantId,
      payment_id: paymentRecord.id,
      merchant: eventData.merchant,
      payer: eventData.payer,
      amount: eventData.amount.toString(),
      tx_hash: txHash,
      timestamp: eventData.timestamp.toString(),
    })

    let subscriptionData = null

    if ((create_subscription || plan_id) && plan_id) {
      try {
        subscriptionData = await createSubscription({
          merchantId,
          customer: eventData.payer,
          wallet: eventData.payer,
          planId: plan_id,
          txHash: txHash,
        })

        await triggerWebhook('subscription_created', {
          merchant_id: merchantId,
          subscription_id: subscriptionData.id,
          customer: eventData.payer,
          plan_id: plan_id,
          status: subscriptionData.status,
          current_period_end: subscriptionData.current_period_end,
        })

      } catch (subError: any) {
        console.error('Failed to create subscription:', subError)
      }
    }

    return NextResponse.json({
      verified: true,
      payer: eventData.payer,
      merchant: eventData.merchant,
      amount: eventData.amount.toString(),
      timestamp: eventData.timestamp.toString(),
      payment_id: paymentRecord.id,
      subscription: subscriptionData ? {
        subscription_id: subscriptionData.id,
        status: subscriptionData.status,
        current_period_end: subscriptionData.current_period_end,
      } : undefined,
    })
  } catch (error: any) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error', verified: false },
      { status: 500 }
    )
  }
}

