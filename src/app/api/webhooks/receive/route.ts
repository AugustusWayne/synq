import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    
    console.log('Webhook received:', {
      event: payload.event,
      timestamp: new Date().toISOString(),
      data: payload,
    })

    return NextResponse.json({ 
      received: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

