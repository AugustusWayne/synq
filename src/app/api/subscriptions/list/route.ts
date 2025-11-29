import { NextRequest, NextResponse } from 'next/server'
import { ensureSupabase } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const supabase = ensureSupabase()
    const { searchParams } = new URL(req.url)
    const merchant = searchParams.get('merchant')
    const customer = searchParams.get('customer')

    let query = supabase
      .from('subscriptions')
      .select(`
        *,
        plans (
          id,
          name,
          amount,
          interval
        )
      `)
      .order('created_at', { ascending: false })

    if (merchant) {
      const { data: merchantData } = await supabase
        .from('merchants')
        .select('id')
        .eq('wallet', merchant.toLowerCase())
        .single()

      if (merchantData) {
        query = query.eq('merchant_id', merchantData.id)
      }
    }

    if (customer) {
      query = query.eq('payer_wallet', customer.toLowerCase())
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({
      subscriptions: data || [],
      count: data?.length || 0,
    })
  } catch (error: any) {
    console.error('Error listing subscriptions:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to list subscriptions' },
      { status: 500 }
    )
  }
}

