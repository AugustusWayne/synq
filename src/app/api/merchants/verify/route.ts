import { NextRequest, NextResponse } from 'next/server'
import { ensureSupabase } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const supabase = ensureSupabase()
    const body = await req.json()
    const { wallet } = body

    if (!wallet) {
      return NextResponse.json(
        { error: 'Missing wallet address', isMerchant: false },
        { status: 400 }
      )
    }

    const { data: merchant } = await supabase
      .from('merchants')
      .select('id, wallet, created_at')
      .eq('wallet', wallet.toLowerCase())
      .single()

    if (!merchant) {
      return NextResponse.json({
        isMerchant: false,
        message: 'Wallet is not registered as a merchant'
      })
    }

    return NextResponse.json({
      isMerchant: true,
      merchant: {
        id: merchant.id,
        wallet: merchant.wallet,
        registered: merchant.created_at
      }
    })
  } catch (error: any) {
    console.error('Error verifying merchant:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify merchant', isMerchant: false },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const wallet = searchParams.get('wallet')

  if (!wallet) {
    return NextResponse.json(
      { error: 'Missing wallet parameter', isMerchant: false },
      { status: 400 }
    )
  }

  return POST(
    new NextRequest(req.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet }),
    })
  )
}

