import { NextRequest, NextResponse } from 'next/server'
import { runInvoiceAgent } from '@/agents/invoice'
import { runRenewAgent } from '@/agents/renew'
import { runAnalyticsAgent } from '@/agents/analytics'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { agent, merchantId } = body

    console.log(`Running agent: ${agent}`, merchantId ? `for merchant: ${merchantId}` : '')

    if (agent === 'invoice') {
      const result = await runInvoiceAgent()
      return NextResponse.json(result)
    }

    if (agent === 'renew') {
      const result = await runRenewAgent()
      return NextResponse.json(result)
    }

    if (agent === 'analytics') {
      if (!merchantId) {
        return NextResponse.json(
          { error: 'merchantId required for analytics' },
          { status: 400 }
        )
      }
      const result = await runAnalyticsAgent(merchantId)
      return NextResponse.json(result)
    }

    return NextResponse.json(
      { error: 'Unknown agent. Valid agents: invoice, renew, analytics' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Agent error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to run agent' },
      { status: 500 }
    )
  }
}

