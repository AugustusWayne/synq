import { ensureSupabase } from "@/lib/db"
import { geminiGenerate } from "./gemini"

export async function runInvoiceAgent(merchantWallet?: string) {
  const supabase = ensureSupabase()
  
  let query = supabase
    .from("payments")
    .select("*")
    .eq("status", "verified")
    .or("invoice_sent.is.null,invoice_sent.eq.false")
    .limit(10)

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

  const { data: payments, error: queryError } = await query

  if (queryError) {
    console.error('Query error:', queryError)
    throw queryError
  }

  if (!payments || payments.length === 0) {
    return { status: "no-new-payments", processed: 0 }
  }

  let processed = 0
  const generatedInvoices: any[] = []

  for (const p of payments) {
    try {
      const { data: merchant } = await supabase
        .from("merchants")
        .select("*")
        .eq("id", p.merchant_id)
        .single()

      if (!merchant) {
        continue
      }

      const invoiceText = await geminiGenerate(`
Generate a professional invoice in plain text format:

Merchant Wallet: ${merchant.wallet}
Payer Wallet: ${p.payer}
Amount: ${(Number(p.amount) / 1e18).toFixed(4)} AVAX
Transaction Hash: ${p.tx_hash}
Timestamp: ${new Date(Number(p.timestamp) * 1000).toLocaleString()}

Include:
- Invoice number (format: INV-${p.id.slice(0, 8).toUpperCase()})
- Payment summary
- Formatted date
- Transaction details
- Professional thank you message
- Keep it concise and professional
      `)

      const { error: updateError } = await supabase
        .from("payments")
        .update({ 
          invoice_sent: true,
          invoice_text: invoiceText 
        })
        .eq("id", p.id)

      if (updateError) {
        console.error(`Failed to update payment ${p.id}:`, updateError)
      } else {
        processed++
        generatedInvoices.push({
          id: p.id,
          invoice_number: `INV-${p.id.slice(0, 8).toUpperCase()}`,
          amount: (Number(p.amount) / 1e18).toFixed(4),
          text: invoiceText
        })
      }
    } catch (error) {
      console.error(`Failed to generate invoice for payment ${p.id}:`, error)
    }
  }

  return { 
    status: "ok", 
    processed,
    invoices: generatedInvoices
  }
}

