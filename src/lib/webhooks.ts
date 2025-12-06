import { ensureSupabase } from './db'

export async function triggerWebhook(event: string, data: any) {
  try {
    const supabase = ensureSupabase()
    const merchantId = data.merchant_id

    if (!merchantId) {
      return
    }

    const { data: merchant } = await supabase
      .from('merchants')
      .select('webhook_url')
      .eq('id', merchantId)
      .single()

    if (!merchant?.webhook_url) {
      return
    }

    const payload = {
      event,
      data,
      timestamp: new Date().toISOString(),
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    try {
      const response = await fetch(merchant.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': event,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        console.error(`Webhook failed: ${response.status} ${response.statusText}`)
        return
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        console.error('Webhook request timeout')
      } else {
        console.error('Error sending webhook:', fetchError.message)
      }
    }
  } catch (error) {
    console.error('Error triggering webhook:', error)
  }
}
