import { ensureSupabase } from "@/lib/db"
import { geminiGenerate } from "./gemini"

export async function runInvoiceAgent() {
  const supabase = ensureSupabase()
  
  console.log('Invoice Agent: Querying payments...')
  
  const { data: payments, error: queryError } = await supabase
    .from("payments")
    .select("*")
    .eq("status", "verified")
    .or("invoice_sent.is.null,invoice_sent.eq.false")
    .limit(10)

  if (queryError) {
    console.error('Query error:', queryError)
    throw queryError
  }

  console.log(`Invoice Agent: Found ${payments?.length || 0} payments needing invoices`)

  if (!payments || payments.length === 0) {
    return { status: "no-new-payments", processed: 0 }
  }

  let processed = 0

  for (const p of payments) {
    try {
      console.log(`Processing payment: ${p.id}`)
      
      const { data: merchant } = await supabase
        .from("merchants")
        .select("*")
        .eq("id", p.merchant_id)
        .single()

      if (!merchant) {
        console.log(`Merchant not found for payment ${p.id}`)
        continue
      }

      console.log(`Generating invoice for payment ${p.id}...`)

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

      console.log("Generated Invoice:")
      console.log(invoiceText)
      console.log('---')

      const { error: updateError } = await supabase
        .from("payments")
        .update({ invoice_sent: true })
        .eq("id", p.id)

      if (updateError) {
        console.error(`Failed to update payment ${p.id}:`, updateError)
      } else {
        console.log(`✓ Invoice generated and marked for payment ${p.id}`)
        processed++
      }
    } catch (error) {
      console.error(`Failed to generate invoice for payment ${p.id}:`, error)
    }
  }

  console.log(`Invoice Agent: Processed ${processed} invoices`)
  return { status: "ok", processed }
}

