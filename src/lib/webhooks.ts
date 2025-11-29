import { ensureSupabase } from './db'

export async function triggerWebhook(event: string, data: any) {
  try {
    const supabase = ensureSupabase()
    const merchantId = data.merchant_id

    if (!merchantId) {
      console.log('No merchant_id provided, skipping webhook')
      return
    }

    const { data: merchant } = await supabase
      .from('merchants')
      .select('webhook_url')
      .eq('id', merchantId)
      .single()

    if (!merchant?.webhook_url) {
      console.log(`No webhook URL configured for merchant ${merchantId}`)
      return
    }

    console.log(`Triggering webhook: ${event} to ${merchant.webhook_url}`)

    const response = await fetch(merchant.webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Event': event,
      },
      body: JSON.stringify({
        event,
        data,
        timestamp: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      console.error(`Webhook failed: ${response.status} ${response.statusText}`)
      return
    }

    console.log(`Webhook delivered successfully: ${event}`)
  } catch (error) {
    console.error('Error triggering webhook:', error)
  }
}

