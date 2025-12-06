import { ensureSupabase } from "@/lib/db"
import { geminiGenerate } from "./gemini"
import { calculateNextBilling } from "@/lib/subscriptions"

export async function runRenewAgent(merchantWallet?: string) {
  const supabase = ensureSupabase()
  const now = Math.floor(Date.now() / 1000)

  let query = supabase
    .from("subscriptions")
    .select("*, plans(*)")
    .eq("status", "active")
    .lt("current_period_end", now)
    .limit(20)

  // If merchantWallet provided, filter by merchant
  if (merchantWallet) {
    const { data: merchant } = await supabase
      .from("merchants")
      .select("id")
      .eq("wallet", merchantWallet.toLowerCase())
      .single()

    if (merchant) {
      query = query.eq("merchant_id", merchant.id)
    }
  }

  const { data: subs } = await query

  if (!subs || subs.length === 0) {
    return { status: "no-expired-subscriptions", renewed: 0 }
  }

  let renewed = 0

  for (const sub of subs) {
    try {
      if (!sub.plans) continue

      const nextPeriodEnd = calculateNextBilling(sub.plans.interval)

      await supabase
        .from("subscriptions")
        .update({
          current_period_end: nextPeriodEnd,
          status: "payment_required",
          updated_at: new Date().toISOString(),
        })
        .eq("id", sub.id)

      const msg = await geminiGenerate(`
Write a friendly subscription renewal reminder message.

Customer Wallet: ${sub.payer_wallet}
Plan: ${sub.plans.name}
Amount: ${(Number(sub.plans.amount) / 1e18).toFixed(4)} AVAX
Interval: ${sub.plans.interval}
Subscription Expired: ${new Date(sub.current_period_end * 1000).toLocaleDateString()}
New Period Will End: ${new Date(nextPeriodEnd * 1000).toLocaleDateString()}

Keep it:
- Friendly and professional
- Include payment instructions
- Mention benefits of staying subscribed
- Brief (3-4 sentences)
      `)

      renewed++
    } catch (error) {
      console.error(`Failed to renew subscription ${sub.id}:`, error)
    }
  }

  return { status: "renewed", count: renewed }
}

