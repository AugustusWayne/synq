import { NextRequest, NextResponse } from 'next/server'
import { ensureSupabase } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const supabase = ensureSupabase()
    const body = await req.json()
    const { merchant_wallet, name, amount, interval } = body

    if (!merchant_wallet || !name || !amount || !interval) {
      return NextResponse.json(
        { error: 'Missing required fields: merchant_wallet, name, amount, interval' },
        { status: 400 }
      )
    }

    if (!['weekly', 'monthly', 'yearly'].includes(interval)) {
      return NextResponse.json(
        { error: 'Invalid interval. Must be: weekly, monthly, or yearly' },
        { status: 400 }
      )
    }

    const { data: merchant } = await supabase
      .from('merchants')
      .select('id')
      .eq('wallet', merchant_wallet.toLowerCase())
      .single()

    if (!merchant) {
      return NextResponse.json(
        { error: 'Merchant not found' },
        { status: 404 }
      )
    }

    const { data: plan, error } = await supabase
      .from('plans')
      .insert({
        merchant_id: merchant.id,
        name,
        amount: amount.toString(),
        interval,
      })
      .select()
      .single()

    if (error) throw error


    return NextResponse.json({
      plan_id: plan.id,
      name: plan.name,
      amount: plan.amount,
      interval: plan.interval,
      merchant_id: plan.merchant_id,
    })
  } catch (error: any) {
    console.error('Error creating plan:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create plan' },
      { status: 500 }
    )
  }
}

