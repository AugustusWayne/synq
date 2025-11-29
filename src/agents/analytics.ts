import { ensureSupabase } from "@/lib/db"
import { geminiGenerate } from "./gemini"

export async function runAnalyticsAgent(merchantId: string) {
  const supabase = ensureSupabase()

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("merchant_id", merchantId)

  if (!payments) {
    return { summary: "No payment data available" }
  }

  const totalRevenue = payments.reduce((a, p) => a + Number(p.amount), 0) / 1e18
  const paymentCount = payments.length

  const { data: activeSubs } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("merchant_id", merchantId)
    .eq("status", "active")

  const { data: allSubs } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("merchant_id", merchantId)

  const canceledSubs = allSubs?.filter(s => s.status === "canceled").length || 0
  const expiredSubs = allSubs?.filter(s => s.status === "expired").length || 0

  const recentPayments = payments
    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
    .slice(0, 5)
    .map(p => ({
      amount: (Number(p.amount) / 1e18).toFixed(4),
      date: new Date(Number(p.timestamp) * 1000).toLocaleDateString(),
    }))

  const summary = await geminiGenerate(`
Create a comprehensive analytics summary for a Web3 subscription merchant:

REVENUE METRICS:
- Total Revenue: ${totalRevenue.toFixed(4)} AVAX
- Total Payments: ${paymentCount}
- Average Payment: ${(totalRevenue / paymentCount || 0).toFixed(4)} AVAX

SUBSCRIPTION METRICS:
- Active Subscriptions: ${activeSubs?.length || 0}
- Canceled: ${canceledSubs}
- Expired: ${expiredSubs}
- Total Lifetime Subscriptions: ${allSubs?.length || 0}

RECENT ACTIVITY:
${recentPayments.map((p, i) => `${i + 1}. ${p.amount} AVAX on ${p.date}`).join('\n')}

Provide:
1. Key insights and trends (2-3 bullet points)
2. Actionable recommendations (2-3 bullet points)
3. Overall health assessment
4. Growth suggestions

Keep it concise and actionable. Format with clear sections.
  `)

  return { 
    summary,
    metrics: {
      totalRevenue: totalRevenue.toFixed(4),
      paymentCount,
      activeSubscriptions: activeSubs?.length || 0,
      canceledSubscriptions: canceledSubs,
      expiredSubscriptions: expiredSubs,
    }
  }
}

