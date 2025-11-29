import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { avalancheFuji } from 'viem/chains'
import { paymentsAbi, paymentsAddress } from '@/lib/contract'
import { ensureSupabase } from '@/lib/db'
import { triggerWebhook } from '@/lib/webhooks'

const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http(),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = ensureSupabase()
    
    const body = await req.json()
    const { txHash, merchant, amount } = body

    if (!txHash || !merchant || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: txHash, merchant, amount' },
        { status: 400 }
      )
    }

    console.log('Verifying payment:', { txHash, merchant, amount })

    const transaction = await publicClient.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found', verified: false },
        { status: 404 }
      )
    }

    console.log('Transaction found, block:', transaction.blockNumber)

    const logs = await publicClient.getLogs({
      address: paymentsAddress,
      event: parseAbiItem('event PaymentReceived(address indexed merchant, address indexed payer, uint256 amount, uint256 timestamp)'),
      fromBlock: transaction.blockNumber,
      toBlock: transaction.blockNumber,
    })

    console.log('Found logs:', logs.length)

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

    console.log('Event verified:', eventData)

    const { data: merchantData } = await supabase
      .from('merchants')
      .select('id')
      .eq('wallet', merchant.toLowerCase())
      .single()

    let merchantId = merchantData?.id

    if (!merchantId) {
      console.log('Merchant not found, creating new merchant')
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
        console.log('Payment already recorded')
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

    console.log('Payment verified + saved:', paymentRecord)

    await triggerWebhook('payment_succeeded', {
      payment_id: paymentRecord.id,
      merchant: eventData.merchant,
      payer: eventData.payer,
      amount: eventData.amount.toString(),
      tx_hash: txHash,
      timestamp: eventData.timestamp.toString(),
    })

    return NextResponse.json({
      verified: true,
      payer: eventData.payer,
      merchant: eventData.merchant,
      amount: eventData.amount.toString(),
      timestamp: eventData.timestamp.toString(),
      payment_id: paymentRecord.id,
    })
  } catch (error: any) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error', verified: false },
      { status: 500 }
    )
  }
}

